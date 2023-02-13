
function getDataType(val) {
  if (Array.isArray(val)) return 'array';
  if (val === null) return 'null';
  return typeof val;
}
function element(name) {
  return document.createElement(name);
}

function append(target, node) {
  target.appendChild(node);
}

function listen(node, event, handler) {
  node.addEventListener(event, handler);
  return () => node.removeEventListener(event, handler);
}

function detach(node) {
  node.parentNode.removeChild(node);
}


const css_classes = {
    HIDDEN: 'hidden',
    CARET_ICON: 'caret-icon',
    CARET_RIGHT: 'fa-caret-right',
    CARET_DOWN: 'fa-caret-down',
    ICON: 'fas'
}

function expandedTemplate(params = {}) {
  const { key, size } = params;
  return `
    <div class="line">
      <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
      <div class="json-key">${key}</div>
      <div class="json-size">${size}</div>
    </div>
  `
}

function notExpandedTemplate(params = {}) {
  const { key, value, type } = params;
  return `
    <div class="line">
      <div class="empty-icon"></div>
      <div class="json-key">${key}</div>
      <div class="json-separator">:</div>
      <div class="json-value json-${type}">${value}</div>
    </div>
  `
}

function createContainerElement() {
  const el = element('div');
  el.className = 'json-container';
  return el;
}

function hideNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.add(css_classes.HIDDEN);
    if (child.isExpanded) {
      hideNodeChildren(child);
    }
  });
}

function showNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.remove(css_classes.HIDDEN);
    if (child.isExpanded) {
      showNodeChildren(child);
    }
  });
}

function setCaretIconDown(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector('.' + css_classes.ICON);
    if (icon) {
      icon.classList.replace(css_classes.CARET_RIGHT, css_classes.CARET_DOWN);
    }
  }
}

function setCaretIconRight(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector('.' + css_classes.ICON);
    if (icon) {
      icon.classList.replace(css_classes.CARET_DOWN, css_classes.CARET_RIGHT);
    }
  }
}

function toggleNode(node) {
  if (node.isExpanded) {
    node.isExpanded = false;
    setCaretIconRight(node);
    hideNodeChildren(node);
  } else {
    node.isExpanded = true;
    setCaretIconDown(node);
    showNodeChildren(node);
  }
}

/**
 * Create node html element
 * @param {object} node 
 * @return html element
 */
function createNodeElement(node) {
  let el = element('div');

  const getSizeString = (node) => {
    const len = node.children.length;
    if (node.type === 'array') return `[${len}]`;
    if (node.type === 'object') return `{${len}}`;
    return null;
  }

  if (node.children.length > 0) {
    el.innerHTML = expandedTemplate({
      key: node.key,
      size: getSizeString(node),
    })
    const caretEl = el.querySelector('.' + css_classes.CARET_ICON);
    node.dispose = listen(caretEl, 'click', () => toggleNode(node));
  } else {
    el.innerHTML = notExpandedTemplate({
      key: node.key,
      value: node.value,
      type: typeof node.value
    })
  }

  const lineEl = el.children[0];

  if (node.parent !== null) {
    lineEl.classList.add(css_classes.HIDDEN);
  }

  lineEl.style = 'margin-left: ' + node.depth * 18 + 'px;';

  return lineEl;
}

/**
 * Recursively traverse Tree object
 * @param {Object} node
 * @param {Callback} callback
 */
function traverse(node, callback) {
  callback(node);
  if (node.children.length > 0) {
    node.children.forEach((child) => {
      traverse(child, callback);
    });
  }
}

/**
 * Create node object
 * @param {object} opt options
 * @return {object}
 */
function createNode(opt = {}) {
  return {
    key: opt.key || null,
    parent: opt.parent || null,
    value: opt.hasOwnProperty('value') ? opt.value : null,
    isExpanded: opt.isExpanded || false,
    type: opt.type || null,
    children: opt.children || [],
    el: opt.el || null,
    depth: opt.depth || 0,
    dispose: null
  }
}

/**
 * Create subnode for node
 * @param {object} Json data
 * @param {object} node
 */
function createSubnode(data, node) {
  if (typeof data === 'object') {
    for (let key in data) {
      const child = createNode({
        value: data[key],
        key: key,
        depth: node.depth + 1,
        type: getDataType(data[key]),
        parent: node,
      });
      node.children.push(child);
      createSubnode(data[key], child);
    }
  }
}

function getJsonObject(data) {
  return typeof data === 'string' ? JSON.parse(data) : data;
}

/**
 * Create tree
 * @param {object | string} jsonData 
 * @return {object}
 */
function jsonview_create(jsonData) {
  const parsedData = getJsonObject(jsonData);
  const rootNode = createNode({
    value: parsedData,
    key: getDataType(parsedData),
    type: getDataType(parsedData),
  });
  createSubnode(parsedData, rootNode);
  return rootNode;
}

/**
 * Render JSON string into DOM container
 * @param {string | object} jsonData
 * @param {htmlElement} targetElement
 * @return {object} tree
 */
function renderJSON(jsonData, targetElement) {
  const parsedData = getJsonObject(jsonData);
  const tree = createTree(parsedData);
  render(tree, targetElement);
  return tree;
}

/**
 * Render tree into DOM container
 * @param {object} tree
 * @param {htmlElement} targetElement
 */
function jsonview_render(tree, targetElement) {
  const containerEl = createContainerElement();

  traverse(tree, function(node) {
    node.el = createNodeElement(node);
    containerEl.appendChild(node.el);
  });

  targetElement.appendChild(containerEl);
}

function  jsonview_expand(node) {
  traverse(node, function(child) {
    child.el.classList.remove(css_classes.HIDDEN);
    child.isExpanded = true;
    setCaretIconDown(child);
  });
}

function collapse(node) {
  traverse(node, function(child) {
    child.isExpanded = false;
    if (child.depth > node.depth) child.el.classList.add(css_classes.HIDDEN);
    setCaretIconRight(child);
  });
}

function destroy(tree) {
  traverse(tree, (node) => {
    if (node.dispose) {
      node.dispose(); 
    }
  })
  detach(tree.el.parentNode);
}

