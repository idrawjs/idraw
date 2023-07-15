// Thanks to: https://github.com/HenrikJoreteg/html-parse-stringify/
import { HTMLNode } from '@idraw/types';

const attrRegExp = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;
const elemRegExp = /<[a-zA-Z0-9\-\!\/](?:"[^"]*"|'[^']*'|[^'">])*>/g;
const whitespaceReg = /^\s*$/;

const singleElements: Record<string, boolean> = {};

function parseElement(element: string): HTMLNode {
  const node: HTMLNode = {
    type: 'element',
    name: '',
    isVoid: false,
    attributes: {},
    children: []
  };

  const elementMatch = element.match(/<\/?([^\s]+?)[/\s>]/);
  if (elementMatch) {
    node.name = elementMatch[1];
    if (singleElements[elementMatch[1]] || element.charAt(element.length - 2) === '/') {
      node.isVoid = true;
    }

    if (node.name.startsWith('!--')) {
      const endIndex = element.indexOf('-->');
      return {
        type: 'comment',
        name: null,
        attributes: {},
        children: [],
        isVoid: false,
        comment: endIndex !== -1 ? element.slice(4, endIndex) : ''
      };
    }
  }

  const reg = new RegExp(attrRegExp);
  let result = null;
  while (true) {
    result = reg.exec(element);

    if (result === null) {
      break;
    }

    if (!result[0].trim()) {
      continue;
    }

    if (result[1]) {
      const attr = result[1].trim();
      let arr = [attr, ''];
      if (attr.indexOf('=') > -1) {
        arr = attr.split('=');
      }
      node.attributes[arr[0]] = arr[1];
      reg.lastIndex--;
    } else if (result[2]) {
      node.attributes[result[2]] = result[3].trim().substring(1, result[3].length - 1);
    }
  }

  return node;
}

export function parseHTML(html: string) {
  const result: HTMLNode[] = [];
  const arr: HTMLNode[] = [];
  let current: HTMLNode | HTMLNode[];
  let level = -1;
  let inComponent = false;
  html.replace(elemRegExp, (element: string, index: number) => {
    if (inComponent && !Array.isArray(current)) {
      if (element !== '</' + current.name + '>') {
        return element;
      } else {
        inComponent = false;
      }
    }
    const isOpen = element.charAt(1) !== '/';
    const isComment = element.startsWith('<!--');
    const start = index + element.length;
    const nextChar = html.charAt(start);
    let parent;

    if (isComment) {
      const comment: HTMLNode = parseElement(element);

      if (level < 0) {
        result.push(comment);
        return element;
      }
      parent = arr[level];
      parent.children.push(comment);
      return element;
    }

    if (isOpen) {
      level++;

      current = parseElement(element);
      if (!current.isVoid && !inComponent && nextChar && nextChar !== '<') {
        const content = html.slice(start, html.indexOf('<', start));
        if (content.trim()) {
          current.children.push({
            type: 'text',
            name: null,
            attributes: {},
            children: [],
            isVoid: false,
            textContent: content.trim()
          });
        }
      }

      if (level === 0) {
        result.push(current);
      }

      parent = arr[level - 1];

      if (parent) {
        parent.children.push(current);
      }

      arr[level] = current;
    }

    if (!isOpen || (!Array.isArray(current) && current.isVoid)) {
      if (level > -1 && !Array.isArray(current) && (current.isVoid || current.name === element.slice(2, -1))) {
        level--;
        current = level === -1 ? result : arr[level];
      }
      if (!inComponent && nextChar !== '<' && nextChar) {
        parent = level === -1 ? result : arr[level].children;

        const end = html.indexOf('<', start);
        let content = html.slice(start, end === -1 ? undefined : end);
        if (whitespaceReg.test(content)) {
          content = ' ';
        }

        if ((end > -1 && level + parent.length >= 0) || content !== ' ') {
          if (content.trim()) {
            parent.push({
              type: 'text',
              name: null,
              attributes: {},
              children: [],
              isVoid: false,
              textContent: content.trim()
            });
          }
        }
      }
    }
    return element;
  });
  return result;
}

function attrString(attrs: HTMLNode['attributes']) {
  const buff = [];
  for (let key in attrs) {
    buff.push(key + '="' + attrs[key] + '"');
  }
  if (!buff.length) {
    return '';
  }
  return ' ' + buff.join(' ');
}

function stringify(buff: string, htmlNode: HTMLNode): string {
  switch (htmlNode.type) {
    case 'text':
      return buff + htmlNode.textContent;
    case 'element':
      buff += '<' + htmlNode.name + (htmlNode.attributes ? attrString(htmlNode.attributes) : '') + (htmlNode.isVoid ? '/>' : '>');
      if (htmlNode.isVoid) {
        return buff;
      }
      return buff + htmlNode.children.reduce(stringify, '') + '</' + htmlNode.name + '>';
    case 'comment':
      buff += '<!--' + htmlNode.comment + '-->';
      return buff;
  }
}

export function generateHTML(htmlNodes: HTMLNode[]) {
  return htmlNodes.reduce(function (token, rootEl) {
    return token + stringify('', rootEl);
  }, '');
}
