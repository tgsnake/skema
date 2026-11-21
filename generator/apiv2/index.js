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
const reNamespace = /((\w+\.)?(\w+))#(\w+)\s+/m; // /([\w.]+)#(\w+)\s+/m;
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
// https://stackoverflow.com/questions/54246477/how-to-convert-camelcase-to-snake-case-in-javascript
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
      break;
    case 'delete':
      return '_delete';
      break;
    case 'static':
      return '_static';
      break;
    case 'public':
      return '_public';
      break;
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

function parseTlLine(line, hasFlags, id, namespace, className, typesMap) {
  let constructorString = '';
  let classNameFull = `${namespace ? namespace : ''}${className}`;
  let reader = hasFlags ? '' : '// no flags';
  let writer = hasFlags ? '' : '// no flags';
  let slots = [];
  let types = [];
  let imports = [];
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
          type: getType(flagType, typesMap),
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
          type: getType(argType, typesMap),
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
    imports,
  };
}

function buildInterfaceContent({ name, type, required }) {
  return `${name}${required ? ':' : '?:'}${type};`;
}
function buildTypeContent({ name, type, required }) {
  return `${name}${required ? '!:' : '?:'}${type};`;
}

function getType(type, typesMap) {
  switch (type) {
    case 'true':
    case 'false':
      return 'boolean';
    case '!X':
    case 'X':
      return 'Raw.X';
    case 'Object':
      return 'any';
    default:
      let reDefault =
        /^(X|Type|Bool|int|double|float|int128|int256|long|bytes|Vector<(\w+\.?\w+?)>|string|number)$/i;
      if (reDefault.test(type.trim())) {
        if (/Vector<(\w+\.?\w+?)>/i.test(type.trim())) {
          let [_full, vectorType] = type.trim().match(/Vector<(\w+\.?\w+?)>/i);
          return `Raw.Vector<${getType(vectorType, typesMap)}>`;
        }
        return /^(string|number)$/i.test(type.trim()) ? type : `Raw.${type}`;
      }
      let typeSplit = type.trim().split('.');
      let targetNs = typeSplit.length > 1 ? typeSplit[0] : 'root';
      let bareName = typeSplit[typeSplit.length > 1 ? 1 : 0];
      let cleanBareName = bareName.includes('_') ? snakeCaseToCamelCase(bareName) : bareName;
      let typeName = `Type${Uppercase(cleanBareName)}`;
      if (!typesMap.has(targetNs)) {
        typesMap.set(targetNs, new Map());
      }
      if (!typesMap.get(targetNs).has(typeName)) {
        typesMap.get(targetNs).set(typeName, crc32(type.trim()));
      }
      return typeSplit.length > 1 ? `Raw.${targetNs}.${typeName}` : `Raw.${typeName}`;
  }
}

function start(source, classTemplate, importTemplate) {
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
        if (section === 'functions') {
          typeTLFn.push(`${namespace ?? 'root.'}${name}`);
          typesArgsString += `  __response__!: ${getType(results, typesMap)};\n`;
        }
        if (section === 'types') {
          getType(results, typesMap);
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
        const parsed = parseTlLine(line, hasFlags, id, namespace, name, typesMap);
        const content = replacer(classTemplate, {
          'CLASS-NAME': parsed.className,
          'CLASS-NAME-WITH-NAMESPACE': parsed.classNameFull,
          'CONSTRUCTOR-VALUES': `this.classType = "${section}"\n    this.className = "${namespace ?? ''}${name}"\n    this.constructorId = 0x${id}\n    this.subclassOfId = 0x${crc32(results).toString(16)}\n    this._slots = ${JSON.stringify(parsed.slots)}\n${parsed.constructorString}`,
          IMPORT: parsed.imports.length
            ? parsed.imports
                .map((e) =>
                  replacer(importTemplate, {
                    ACTION: e.istypes ? 'import type' : 'import',
                    PACKAGE: e.package,
                    SOURCE: e.source,
                  }),
                )
                .join('\n')
            : '',
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
        if (namespace) {
          if (namespaceMap.has(namespace.replace(/\.$/, ''))) {
            namespaceMap.get(namespace.replace(/\.$/, '')).set(name, content);
          } else {
            let temp = new Map();
            temp.set(name, content);
            namespaceMap.set(namespace.replace(/\.$/, ''), temp);
          }
        } else {
          if (namespaceMap.has('root')) {
            namespaceMap.get('root').set(name, content);
          } else {
            let temp = new Map();
            temp.set(name, content);
            namespaceMap.set('root', temp);
          }
        }
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
  const allTlObject = fs.readFileSync(
    path.join(route, 'generator/api/template/allTlObject.txt'),
    'utf8',
  );
  const classname = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/classname.txt'),
    'utf8',
  );
  const header = fs.readFileSync(path.join(route, 'generator/apiv2/template/header.txt'), 'utf8');
  const index = fs.readFileSync(path.join(route, 'generator/apiv2/template/index.txt'), 'utf8');
  const packages = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/package.txt'),
    'utf8',
  );
  const raw = fs.readFileSync(path.join(route, 'generator/apiv2/template/raw.txt'), 'utf8');
  const rootTypes = fs.readFileSync(
    path.join(route, 'generator/apiv2/template/root_types_dts.txt'),
    'utf8',
  );
  let { layer, hsclayer, allTLObject, types, classes, functions } = start(
    mtproto + '\n---types---\n' + schema + '\n---types---\n' + secretchat,
    classname,
    packages,
  );
  let rootTypesImport = '';
  let rootTypesExport = '';
  let rootClassesExport = '';
  let importedRootFiles = new Set();
  for (let [namespace, collections] of classes) {
    let exported = `export type * from './types.js';\n`;
    let namespaceDir = path.join(route, 'src/raw/class/tl', namespace);
    if (!fs.existsSync(namespaceDir)) {
      fs.mkdirSync(namespaceDir, {
        recursive: true,
      });
    }
    if (types.has(namespace)) {
      let tempImport = '';
      let tempTypes = '';
      let importedFiles = new Set();
      for (let [typeName, collectionsMap] of types.get(namespace)) {
        let temp = [];
        for (let [parent, files] of collectionsMap) {
          for (let file of files) {
            let importKey = `${parent}/${file}`;
            if (!importedFiles.has(importKey)) {
              importedFiles.add(importKey);
              tempImport += replacer(packages, {
                ACTION: 'import type',
                PACKAGE: `{ default as ${file} }`,
                SOURCE: `'${namespace === parent ? '.' : `../${parent}`}/${file}.js'`,
              });
            }
            if (namespace === 'root') {
              if (!importedRootFiles.has(importKey)) {
                importedRootFiles.add(importKey);
                rootTypesImport += replacer(packages, {
                  ACTION: 'import type',
                  PACKAGE: `{ default as ${file} }`,
                  SOURCE: `'./tl/${parent}/${file}.js'`,
                });
              }
            }
            temp.push(file);
          }
        }
        if (namespace === 'root' && typeName === 'TypeUpdate') {
          temp.push('UpdateSecretChatMessage');
          if (!importedFiles.has('custom/UpdateSecretChat')) {
            importedFiles.add('custom/UpdateSecretChat');
            tempImport += `import type { UpdateSecretChatMessage } from '../../custom/UpdateSecretChat.js';\n`;
          }
          if (!importedRootFiles.has('custom/UpdateSecretChat')) {
            importedRootFiles.add('custom/UpdateSecretChat');
            rootTypesImport += `import type { UpdateSecretChatMessage } from './custom/UpdateSecretChat.js';\n`;
          }
        }
        tempTypes += `export type ${typeName} = ${temp.join('|')};\n`;
      }
      fs.writeFileSync(
        path.join(namespaceDir, 'types.ts'),
        replacer(index, {
          HEADER: header,
          EXPORT: `${tempImport}\n${tempTypes}`,
        }),
      );
      if (namespace === 'root') {
        rootTypesExport += `${tempTypes}\n`;
      }
    } else {
      fs.writeFileSync(
        path.join(namespaceDir, 'types.ts'),
        replacer(index, {
          HEADER: header,
          EXPORT: 'export {};\n',
        }),
      );
    }
    for (let [name, content] of collections) {
      fs.writeFileSync(
        path.join(route, 'src/raw/class/tl', namespace, `${name}.ts`),
        replacer(content, {
          HEADER: header,
          'Copyright-Date': new Date().getFullYear(),
        }),
      );
      exported += replacer(packages, {
        ACTION: 'export',
        PACKAGE: `{ default as ${name} }`,
        SOURCE: `'./${name}.js'`,
      });
      if (namespace === 'root') {
        rootClassesExport += replacer(packages, {
          ACTION: 'export',
          PACKAGE: `{ default as ${name} }`,
          SOURCE: `'./tl/root/${name}.js'`,
        });
      }
    }
    fs.writeFileSync(
      path.join(route, 'src/raw/class/tl', namespace, `index.ts`),
      replacer(index, {
        HEADER: header,
        EXPORT: exported,
      }),
    );
    if (namespace !== 'root') {
      rootClassesExport += replacer(packages, {
        ACTION: 'export',
        PACKAGE: `* as ${namespace}`,
        SOURCE: `'./tl/${namespace}/index.js'`,
      });
    }
  }
  if (functions.length) {
    let importedFn = new Set();
    for (let fn of functions) {
      const [namespace] = fn.split('.');
      if (importedFn.has(namespace)) continue;
      rootTypesImport += replacer(packages, {
        ACTION: 'import type',
        PACKAGE: `* as ${namespace}`,
        SOURCE: `'./tl/${namespace}/index.js'`,
      });
      importedFn.add(namespace);
    }
    rootTypesExport += `export type TypesTLRequest = ${functions.join('|')}`;
  }
  fs.writeFileSync(
    path.join(route, 'src/raw/class', 'types.ts'),
    replacer(rootTypes, {
      HEADER: header,
      'Other-Types': `${rootTypesImport}\n${rootTypesExport}`,
    }),
  );
  fs.writeFileSync(
    path.join(route, 'src/raw/class', `Raw.ts`),
    replacer(raw, {
      HEADER: header,
      'TL-Layer': layer,
      'HSC-Layer': hsclayer,
      'EXPORT-CLASSES': rootClassesExport,
    }),
  );
  let allObjectString = Array.from(allTLObject.entries())
    .map(([id, target]) => `  ${id} : ${target},`)
    .join('\n');
  fs.writeFileSync(
    path.join(route, 'src/raw/class/All.ts'),
    replacer(allTlObject, {
      HEADER: header,
      'ALL-OBJECT': allObjectString,
    }),
  );
}
console.log(
  "--- WARNING!! ---\n\nTHIS ACTION WILL BE CHANGE THE Raw.ts AND All.ts FILE\nTHIS ACTION CAN'T BE CANCELLED!\n\n--- build:api ---",
);
generate(process.cwd());
