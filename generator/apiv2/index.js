/**
 * tgsnake - Telegram MTProto library for javascript or typescript.
 * Copyright (C) 2026 tgsnake <https://github.com/tgsnake>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import fs from 'fs';
import path from 'path';

const CORE_TYPES = new Set([
  0xbc799737, // boolFalse#bc799737 = Bool;
  0x997275b5, // boolTrue#997275b5 = Bool;
  0x3fedd339, // true#3fedd339 = True;
  0xc4b9f9bb, // error#c4b9f9bb code:int text:string = Error;
  0x56730bcc, // null#56730bcc = Null;
  0x1cb5c415, // vector#1cb5c415 {t:Type} # [ t ] = Vector t;
]);

const AUTH_KEY_TYPES = new Set([
  0x05162463, // resPQ,
  0x83c95aec, // p_q_inner_data
  0xa9f55f95, // p_q_inner_data_dc
  0x3c6a84d4, // p_q_inner_data_temp
  0x56fddf88, // p_q_inner_data_temp_dc
  0xd0e8075c, // server_DH_params_ok
  0xb5890dba, // server_DH_inner_data
  0x6643b654, // client_DH_inner_data
  0xd712e4be, // req_DH_params
  0xf5045f1f, // set_client_DH_params
  0x3072cfa1, // gzip_packed
]);

const reNamespace = /((\w+\.)?(\w+))#(\w+)\s+/m;
const reArgs = /(\w+):([\w?!.<>#]+)/g;
const reResult = /\s+([\w<>.]+);$/;
const flagsArgType = /flags(\d+)?.(\d+)\?([\w?!.<>#]+)/;
const flagsArg = /flags(\d+)?:#/;
const lineSection = /---(\w+)---/;
const layerSection = /\/\/\s+LAYER\s+(\d+)/;
const layerSecretChat = /={3}(\d+)={3}/;
const VECTOR_CORE_TYPES = new Set([
  'int',
  'long',
  'int128',
  'int256',
  'double',
  'bytes',
  'string',
  'Bool',
  'true',
]);

const PRIMITIVE_TYPES = new Map([
  ['x', 'X'],
  ['type', 'Type'],
  ['bool', 'Bool'],
  ['int', 'int'],
  ['double', 'double'],
  ['float', 'float'],
  ['int128', 'int128'],
  ['int256', 'int256'],
  ['long', 'long'],
  ['bytes', 'bytes'],
  ['vector', 'Vector'],
]);

// https://stackoverflow.com/questions/54242239/how-to-convert-snake-case-to-camelcase-in-typescripts
const snakeCaseToCamelCase = (input) =>
  input
    .split('_')
    .reduce(
      (res, word, i) =>
        i === 0
          ? word.toLowerCase()
          : `${res}${word.charAt(0).toUpperCase()}${word.substr(1).toLowerCase()}`,
      '',
    );

const camelToSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

function execAll(text, regex) {
  let list = [];
  let ex;
  while ((ex = regex.exec(text))) {
    list.push(ex);
  }
  return list;
}

function makeCRCTable() {
  var c;
  var crcTable = [];
  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32(str) {
  str = Buffer.isBuffer(str) ? str.toString('utf8') : str;
  var crcTable = makeCRCTable();
  var crc = 0 ^ -1;
  for (var i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function Uppercase(text) {
  return text.replace(text[0], text[0].toUpperCase());
}

function replacer(input, replace) {
  let results = input;
  for (let [key, value] of Object.entries(replace)) {
    results = results.replace(new RegExp(`{{( )?(${key})( )?}}`, 'gm'), value);
  }
  return results;
}

function parseArgName(argname) {
  switch (argname) {
    case 'default':
      return '_default';
    case 'delete':
      return '_delete';
    case 'static':
      return '_static';
    case 'public':
      return '_public';
    case 'private':
      return '_private';
    default:
      return argname;
  }
}

function getLastMatch(inputText, regex) {
  const match = inputText.match(new RegExp(regex, 'g'));
  if (match) {
    return match[match.length - 1].match(regex);
  }
  return match;
}

function getType(type, typesMap, currentNs, usedTracker) {
  const trimmed = type.trim();
  if (trimmed === 'true' || trimmed === 'false') {
    return 'boolean';
  }
  if (trimmed === '!X' || trimmed === 'X') {
    if (usedTracker) usedTracker.primitives.add('X');
    return 'X';
  }
  if (trimmed === 'Object') {
    return 'any';
  }
  if (/Vector<(\w+\.?\w+?)>/i.test(trimmed)) {
    let [_full, vectorType] = trimmed.match(/Vector<(\w+\.?\w+?)>/i);
    if (usedTracker) usedTracker.primitives.add('Vector');
    let inner = getType(vectorType, typesMap, currentNs, usedTracker);
    return `Vector<${inner}>`;
  }
  if (/^(string|number)$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  let lower = trimmed.toLowerCase();
  if (PRIMITIVE_TYPES.has(lower)) {
    let prim = PRIMITIVE_TYPES.get(lower);
    if (usedTracker) usedTracker.primitives.add(prim);
    return prim;
  }

  let typeSplit = trimmed.split('.');
  let targetNs = typeSplit.length > 1 ? typeSplit[0] : 'root';
  let bareName = typeSplit[typeSplit.length > 1 ? 1 : 0];
  let cleanBareName = bareName.includes('_') ? snakeCaseToCamelCase(bareName) : bareName;
  let typeName = `Type${Uppercase(cleanBareName)}`;

  if (!typesMap.has(targetNs)) {
    typesMap.set(targetNs, new Map());
  }
  if (!typesMap.get(targetNs).has(typeName)) {
    typesMap.get(targetNs).set(typeName, crc32(trimmed));
  }

  if (targetNs === currentNs) {
    return typeName;
  }
  if (targetNs === 'root') {
    if (usedTracker) usedTracker.needsRaw = true;
    return `raw.${typeName}`;
  }
  if (usedTracker) usedTracker.namespaces.add(targetNs);
  return `${targetNs}.${typeName}`;
}

function parseTlLine(line, hasFlags, id, namespace, className, typesMap, currentNs, usedTracker) {
  let constructorString = '';
  let classNameFull = `${namespace ? namespace : ''}${className}`;
  let reader = hasFlags ? '' : '// no flags';
  let writer = hasFlags ? '' : '// no flags';
  let slots = [];
  let types = [];
  for (let [argFull, argName, argType] of execAll(line.trim(), reArgs)) {
    if (argFull === 'X:Type') continue; // skip the {X:Type} args
    argName = snakeCaseToCamelCase(argName);
    if (AUTH_KEY_TYPES.has(parseInt(id, 16))) {
      if (argType === 'string') {
        argType = 'bytes';
      }
    }
    let flag = argType.trim().match(flagsArgType);
    if (/flags(\d+)?/.test(argName) && argType === '#') {
      let writerFlag = [];
      for (let i of execAll(line.trim(), reArgs)) {
        flag = i[2].trim().match(flagsArgType);
        if (flag) {
          if (argName !== `flags${flag[1] ?? ''}`) continue;
          if (flag[3] === 'true' || flag[3].startsWith('Vector')) {
            writerFlag.push(
              `    ${parseArgName(argName)} |= this.${
                i[1].includes('_') ? snakeCaseToCamelCase(i[1]) : i[1]
              } ? (1 << ${flag[2]}) : 0;`,
            );
          } else {
            writerFlag.push(
              `    ${parseArgName(argName)} |= this.${
                i[1].includes('_') ? snakeCaseToCamelCase(i[1]) : i[1]
              } !== undefined ? (1 << ${flag[2]}) : 0;`,
            );
          }
        }
      }
      writer += [
        `\n    // @ts-ignore\n    let ${parseArgName(argName)} = 0;`,
        writerFlag.join('\n'),
        `    b.write((Primitive.Int.write(${parseArgName(argName)})) as unknown as Buffer);\n`,
      ].join('\n');
      reader += `\n    // @ts-ignore\n    let ${parseArgName(argName)} = await Primitive.Int.read(_data);`;
      continue;
    }
    if (flag) {
      let [_flagFull, flagNumber, flagIndex, flagType] = flag;
      if (!flagsArg.test(argName)) {
        types.push({
          name: argName,
          type: getType(flagType, typesMap, currentNs, usedTracker),
          required: false,
        });
        if (!slots.includes(argName.trim())) slots.push(argName.trim());
        constructorString += `    this.${argName} = params.${argName};\n`;
      }
      if (flagType.trim() === 'true') {
        reader += `\n    let ${parseArgName(argName)} = (flags${
          flagNumber ?? ''
        } & (1 << ${flagIndex})) ? true : false;`;
      } else if (VECTOR_CORE_TYPES.has(flagType.trim())) {
        writer += `\n    if(this.${argName} !== undefined){\n`;
        writer += `      b.write((Primitive.${Uppercase(
          flagType.trim(),
        )}.write(this.${argName})) as unknown as Buffer);`;
        writer += `\n    }`;
        reader += `\n    let ${parseArgName(argName)} = (flags${
          flagNumber ?? ''
        } & (1 << ${flagIndex})) ? await Primitive.${Uppercase(
          flagType.trim(),
        )}.read(_data) : undefined;`;
      } else if (/Vector<(\w+\.?\w+?)>/i.test(flagType.trim())) {
        let [_vectorFull, vectorType] = flagType.trim().match(/Vector<(\w+\.?\w+?)>/i);
        writer += `\n    if(this.${argName}){\n`;
        writer += `      b.write((Primitive.Vector.write(this.${argName}${
          VECTOR_CORE_TYPES.has(vectorType.trim())
            ? `,Primitive.${Uppercase(vectorType.trim())}`
            : ''
        })) as unknown as Buffer);`;
        writer += `\n    }`;
        reader += `\n    let ${parseArgName(argName)} = (flags${
          flagNumber ?? ''
        } & (1 << ${flagIndex})) ? await TLObject.read(_data${
          VECTOR_CORE_TYPES.has(vectorType.trim())
            ? `,Primitive.${Uppercase(vectorType.trim())}`
            : ''
        }) : [];`;
      } else {
        writer += `\n    if(this.${argName} !== undefined){\n`;
        writer += `      b.write(this.${argName}.write() as unknown as Buffer);`;
        writer += `\n    }`;
        reader += `\n    let ${parseArgName(argName)} = (flags${
          flagNumber ?? ''
        } & (1 << ${flagIndex})) ? await TLObject.read(_data) : undefined;`;
      }
    } else {
      if (!flagsArg.test(argName)) {
        types.push({
          name: argName,
          type: getType(argType, typesMap, currentNs, usedTracker),
          required: true,
        });
        if (!slots.includes(argName.trim())) slots.push(argName.trim());
        constructorString += `    this.${argName} = params.${argName};\n`;
      }
      if (VECTOR_CORE_TYPES.has(argType.trim())) {
        writer += `\n    if(this.${argName} !== undefined){\n`;
        writer += `      b.write((Primitive.${Uppercase(
          argType.trim(),
        )}.write(this.${argName})) as unknown as Buffer);`;
        writer += `\n    }`;
        reader += `\n    let ${parseArgName(argName)} = await Primitive.${Uppercase(
          argType.trim(),
        )}.read(_data);`;
      } else if (/Vector<(\w+\.?\w+?)>/i.test(argType.trim())) {
        let [_vectorFull, vectorType] = argType.trim().match(/Vector<(\w+\.?\w+?)>/i);
        writer += `\n    if(this.${argName}){\n`;
        writer += `      b.write((Primitive.Vector.write(this.${argName}${
          VECTOR_CORE_TYPES.has(vectorType.trim())
            ? `,Primitive.${Uppercase(vectorType.trim())}`
            : ''
        })) as unknown as Buffer);`;
        writer += `\n    }`;
        reader += `\n    let ${parseArgName(argName)} = await TLObject.read(_data${
          VECTOR_CORE_TYPES.has(vectorType.trim())
            ? `,Primitive.${Uppercase(vectorType.trim())}`
            : ''
        });`;
      } else {
        writer += `\n    if(this.${argName} !== undefined){\n`;
        writer += `      b.write(this.${argName}.write() as unknown as Buffer);`;
        writer += `\n    }`;
        reader += `\n    let ${parseArgName(argName)} = await TLObject.read(_data);`;
      }
    }
  }
  return {
    className,
    classNameFull,
    constructorString,
    reader,
    writer,
    slots,
    types,
  };
}

function buildInterfaceContent({ name, type, required }) {
  return `${name}${required ? ':' : '?:'}${type};`;
}

function buildTypeContent({ name, type, required }) {
  return `${name}${required ? '!:' : '?:'}${type};`;
}

function start(source, classTemplate) {
  let layer;
  let currentLayer;
  let section = 'types';
  let hsclayer = Number(getLastMatch(source, layerSecretChat)[1])
    ? Number(getLastMatch(source, layerSecretChat)[1])
    : 8; // Highest secret chat schema layer, the initial schema is 8
  let typesMap = new Map();
  let typeSubclassMap = new Map();
  let namespaceMap = new Map();
  let allTLObject = new Map();
  let passedId = [];
  let typeTLFn = [];

  for (let line of source.split('\n')) {
    if (layerSection.test(line.trim())) {
      let match = line.trim().match(layerSection);
      layer = Number(match[1]);
      continue;
    }
    if (lineSection.test(line.trim())) {
      let match = line.trim().match(lineSection);
      section = match[1];
      continue;
    }
    if (layerSecretChat.test(line.trim())) {
      let match = line.trim().match(layerSecretChat);
      currentLayer = Number(match[1]);
      continue;
    }
    if (!line.startsWith('//')) {
      if (line.trim() === '') continue;
      let [_input, full, namespace, name, id] = line.trim().match(reNamespace);
      if (CORE_TYPES.has(parseInt(id, 16))) continue;
      let [_resultsFull, results] = line.trim().match(reResult);
      let hasFlags = flagsArg.test(line);
      let typesArgsString = '';

      if (full.includes('_')) {
        full = snakeCaseToCamelCase(full);
        if (namespace) namespace = snakeCaseToCamelCase(namespace);
        name = snakeCaseToCamelCase(name);
      }
      name = Uppercase(name);
      if (currentLayer) {
        name = `${name}${currentLayer}`;
      }
      // to prevent clashes, ignore schemas that have the same id
      if (!passedId.includes(id)) {
        allTLObject.set(`0x${id}`, `"Raw.${namespace ?? ''}${name}"`);
        passedId.push(id);

        let currentNs = namespace ? namespace.replace(/\.$/, '') : 'root';
        let usedTracker = {
          primitives: new Set(),
          namespaces: new Set(),
          needsRaw: false,
        };

        if (section === 'functions') {
          typeTLFn.push(`${namespace ?? 'root.'}${name}`);
          let respType = getType(results, typesMap, currentNs, usedTracker);
          typesArgsString += `  __response__!: ${respType};\n`;
        }
        if (section === 'types') {
          getType(results, typesMap, currentNs, usedTracker);
          if (!typeSubclassMap.has(crc32(results))) {
            typeSubclassMap.set(crc32(results), new Map());
          }
          if (!typeSubclassMap.get(crc32(results)).has((namespace ?? 'root').replace(/\.$/, ''))) {
            typeSubclassMap
              .get(crc32(results))
              .set((namespace ?? 'root').replace(/\.$/, ''), new Set());
          }
          typeSubclassMap
            .get(crc32(results))
            .get((namespace ?? 'root').replace(/\.$/, ''))
            .add(name);
          if (Uppercase(full) === results) {
            if (!typeSubclassMap.has(crc32(camelToSnakeCase(full)))) {
              typeSubclassMap.set(crc32(camelToSnakeCase(full)), new Map());
            }
            if (
              !typeSubclassMap
                .get(crc32(camelToSnakeCase(full)))
                .has((namespace ?? 'root').replace(/\.$/, ''))
            ) {
              typeSubclassMap
                .get(crc32(camelToSnakeCase(full)))
                .set((namespace ?? 'root').replace(/\.$/, ''), new Set());
            }
            const targetSet = typeSubclassMap
              .get(crc32(camelToSnakeCase(full)))
              .get((namespace ?? 'root').replace(/\.$/, ''));
            targetSet.add(name);
            const sourceSet = typeSubclassMap
              .get(crc32(results))
              ?.get((namespace ?? 'root').replace(/\.$/, ''));
            if (sourceSet) {
              for (const item of sourceSet) targetSet.add(item);
            }
          }
        }
        const parsed = parseTlLine(
          line,
          hasFlags,
          id,
          namespace,
          name,
          typesMap,
          currentNs,
          usedTracker,
        );
        const content = replacer(classTemplate, {
          'CLASS-NAME': parsed.className,
          'CLASS-NAME-WITH-NAMESPACE': parsed.classNameFull,
          'CONSTRUCTOR-VALUES': `this.classType = "${section}"\n    this.className = "${namespace ?? ''}${name}"\n    this.constructorId = 0x${id}\n    this.subclassOfId = 0x${crc32(results).toString(16)}\n    this._slots = ${JSON.stringify(parsed.slots)}\n${parsed.constructorString}`,
          READER: parsed.reader,
          WRITER: parsed.writer,
          VARIABLE: parsed.slots.length
            ? `{${parsed.slots.map((e) => `"${e}": ${parseArgName(e)}`).join(',')}}`
            : '',
          TYPES: `${typesArgsString}${parsed.slots.length ? parsed.types.map(buildTypeContent).join('\n') : ''}`,
          PARAMETERS: parsed.slots.length
            ? `params: { ${parsed.types.map(buildInterfaceContent).join('\n')}} `
            : '',
          DOCS: '',
        });

        if (!namespaceMap.has(currentNs)) {
          namespaceMap.set(currentNs, new Map());
        }
        namespaceMap.get(currentNs).set(name, {
          content,
          usedTracker,
        });
      }
    }
  }

  let finalTypes = new Map();
  for (let [typeNamespace, typeCollection] of typesMap) {
    if (!finalTypes.has(typeNamespace)) {
      finalTypes.set(typeNamespace, new Map());
    }
    for (let [typeName, typeKey] of typeCollection) {
      if (/Vector<(\w+\.?\w+?)>/i.test(typeName.trim())) {
        let [_vectorFull, vectorKey] = typeName.trim().match(/Vector<(\w+\.?\w+?)>/i);
        typeName = vectorKey;
        typeKey = crc32(vectorKey.replace('Type', ''));
      }
      if (!typeSubclassMap.has(typeKey)) {
        throw new Error(
          `Can't parsing type ${typeNamespace === 'root' ? typeName : `${typeNamespace}.${typeName}`} with id ${typeKey}`,
        );
      }
      finalTypes.get(typeNamespace).set(typeName, typeSubclassMap.get(typeKey));
    }
  }

  return {
    layer,
    allTLObject,
    hsclayer,
    types: finalTypes,
    classes: namespaceMap,
    functions: typeTLFn,
  };
}

function generate(route) {
  const schema = fs.readFileSync(path.join(route, 'generator/api/source/api.tl'), 'utf8');
  const mtproto = fs.readFileSync(path.join(route, 'generator/api/source/mtproto.tl'), 'utf8');
  const secretchat = fs.readFileSync(
    path.join(route, 'generator/api/source/secretchat.tl'),
    'utf8',
  );
  const allTlObjectTemplate = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/allTlObject.txt'),
    'utf8',
  );
  const classnameTemplate = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/classname.txt'),
    'utf8',
  );
  const headerTemplate = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/header.txt'),
    'utf8',
  );
  const namespaceTemplate = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/namespace.txt'),
    'utf8',
  );
  const rawTemplate = fs.readFileSync(path.join(route, 'generator/apiv2/template/raw.txt'), 'utf8');
  const rootTypesTemplate = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/root_types_dts.txt'),
    'utf8',
  );

  const header = replacer(headerTemplate, {
    'Copyright-Date': new Date().getFullYear(),
  });

  let { layer, hsclayer, allTLObject, types, classes, functions } = start(
    mtproto + '\n---types---\n' + schema + '\n---types---\n' + secretchat,
    classnameTemplate,
  );

  const tlDir = path.join(route, 'src/raw/class/tl');
  if (!fs.existsSync(tlDir)) {
    fs.mkdirSync(tlDir, { recursive: true });
  }

  // Remove any obsolete subdirectories in src/raw/class/tl/
  for (let entry of fs.readdirSync(tlDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      fs.rmSync(path.join(tlDir, entry.name), { recursive: true, force: true });
    }
  }
  // Remove obsolete tl/root.ts if present
  if (fs.existsSync(path.join(tlDir, 'root.ts'))) {
    fs.rmSync(path.join(tlDir, 'root.ts'), { force: true });
  }

  // Generate each namespace file (excluding root)
  for (let [namespace, collections] of classes) {
    if (namespace === 'root') continue;

    let combinedPrimitives = new Set();
    let combinedNamespaces = new Set();
    let needsRaw = false;

    // Collect types for this namespace
    let typesLines = [];
    if (types.has(namespace)) {
      for (let [typeName, collectionsMap] of types.get(namespace)) {
        let subclasses = [];
        for (let [parent, files] of collectionsMap) {
          for (let file of files) {
            if (parent === namespace) {
              subclasses.push(file);
            } else if (parent === 'root') {
              subclasses.push(`raw.${file}`);
              needsRaw = true;
            } else {
              subclasses.push(`${parent}.${file}`);
              combinedNamespaces.add(parent);
            }
          }
        }
        typesLines.push(`export type ${typeName} = ${subclasses.join('|')};`);
      }
    }

    // Collect classes and used trackers
    let classesLines = [];
    for (let [_name, { content, usedTracker }] of collections) {
      classesLines.push(content);
      if (usedTracker) {
        for (let p of usedTracker.primitives) combinedPrimitives.add(p);
        for (let ns of usedTracker.namespaces) {
          if (ns !== namespace) combinedNamespaces.add(ns);
        }
        if (usedTracker.needsRaw) needsRaw = true;
      }
    }

    // Build imports
    let importLines = [];
    if (combinedPrimitives.size > 0) {
      importLines.push(
        `import type { ${Array.from(combinedPrimitives).sort().join(', ')} } from '../types.js';`,
      );
    }
    for (let otherNs of Array.from(combinedNamespaces).sort()) {
      importLines.push(`import type * as ${otherNs} from './${otherNs}.js';`);
    }
    if (needsRaw) {
      importLines.push(`import type * as raw from '../Raw.js';`);
    }

    const namespaceFileContent = replacer(namespaceTemplate, {
      HEADER: header,
      IMPORT: importLines.length ? `\n${importLines.join('\n')}` : '',
      TYPES: typesLines.join('\n'),
      CLASSES: classesLines.join('\n\n'),
    });

    fs.writeFileSync(path.join(tlDir, `${namespace}.ts`), namespaceFileContent);
  }

  // Generate Raw.ts (root classes and types merged here)
  let rootCollections = classes.get('root') || new Map();
  let rootPrimitives = new Set();
  let rootNamespaces = new Set();
  let needsSecretChat = false;

  let rootTypesLines = [];
  if (types.has('root')) {
    for (let [typeName, collectionsMap] of types.get('root')) {
      let subclasses = [];
      for (let [parent, files] of collectionsMap) {
        for (let file of files) {
          if (parent === 'root') {
            subclasses.push(file);
          } else {
            subclasses.push(`${parent}.${file}`);
            rootNamespaces.add(parent);
          }
        }
      }
      if (typeName === 'TypeUpdate') {
        subclasses.push('UpdateSecretChatMessage');
        needsSecretChat = true;
      }
      rootTypesLines.push(`export type ${typeName} = ${subclasses.join('|')};`);
    }
  }

  let rootClassesLines = [];
  for (let [_name, { content, usedTracker }] of rootCollections) {
    rootClassesLines.push(content);
    if (usedTracker) {
      for (let p of usedTracker.primitives) rootPrimitives.add(p);
      for (let ns of usedTracker.namespaces) {
        if (ns !== 'root') rootNamespaces.add(ns);
      }
    }
  }

  let rootImportLines = [];
  if (rootPrimitives.size > 0) {
    rootImportLines.push(
      `import type { ${Array.from(rootPrimitives).sort().join(', ')} } from './types.js';`,
    );
  }
  for (let otherNs of Array.from(rootNamespaces).sort()) {
    rootImportLines.push(`import type * as ${otherNs} from './tl/${otherNs}.js';`);
  }
  if (needsSecretChat) {
    rootImportLines.push(
      `import type { UpdateSecretChatMessage } from './custom/UpdateSecretChat.js';`,
    );
  }

  let exportNamespaces = Array.from(classes.keys())
    .filter((ns) => ns !== 'root')
    .sort()
    .map((ns) => `export * as ${ns} from './tl/${ns}.js';`)
    .join('\n');

  const rawFileContent = replacer(rawTemplate, {
    HEADER: header,
    'TL-Layer': layer,
    'HSC-Layer': hsclayer,
    IMPORT: rootImportLines.length ? `\n${rootImportLines.join('\n')}` : '',
    'EXPORT-NAMESPACES': exportNamespaces,
    TYPES: rootTypesLines.join('\n'),
    CLASSES: rootClassesLines.join('\n\n'),
  });

  fs.writeFileSync(path.join(route, 'src/raw/class/Raw.ts'), rawFileContent);

  // Generate types.ts (primitives and TypesTLRequest)
  let fnNamespaces = new Set();
  let fnTypes = [];
  let needsRawFn = false;

  for (let fn of functions) {
    let [ns, name] = fn.split('.');
    if (ns === 'root') {
      fnTypes.push(`Raw.${name}`);
      needsRawFn = true;
    } else {
      fnTypes.push(`${ns}.${name}`);
      fnNamespaces.add(ns);
    }
  }

  let typeImportLines = [];
  for (let ns of Array.from(fnNamespaces).sort()) {
    typeImportLines.push(`import type * as ${ns} from './tl/${ns}.js';`);
  }
  if (needsRawFn) {
    typeImportLines.push(`import type * as Raw from './Raw.js';`);
  }

  const otherTypes = `${typeImportLines.join('\n')}\n\nexport type TypesTLRequest =\n  | ${fnTypes.join('\n  | ')};`;

  const typesFileContent = replacer(rootTypesTemplate, {
    HEADER: header,
    'Other-Types': otherTypes,
  });

  fs.writeFileSync(path.join(route, 'src/raw/class/types.ts'), typesFileContent);

  // Generate All.ts (AllTLObject mapping)
  let allObjectString = Array.from(allTLObject.entries())
    .map(([id, target]) => `  ${id} : ${target},`)
    .join('\n');

  fs.writeFileSync(
    path.join(route, 'src/raw/class/All.ts'),
    replacer(allTlObjectTemplate, {
      HEADER: header,
      'ALL-OBJECT': allObjectString,
    }),
  );
}
console.log(
  "--- WARNING!! ---\n\nTHIS ACTION WILL BE CHANGE THE Raw.ts AND All.ts FILE\nTHIS ACTION CAN'T BE CANCELLED!\n\n--- build:api ---",
);
generate(process.cwd());
