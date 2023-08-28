function findVueRoot(root) {
  const queue = [root];
  while (queue.length > 0) {
    const currentNode = queue.shift();

    if (currentNode.__vue__ || currentNode.__vue_app__ || currentNode._vnode) {
      console.log("vue detected on root element:", currentNode);
      return currentNode
    }

    for (let i = 0; i < currentNode.childNodes.length; i++) {
      queue.push(currentNode.childNodes[i]);
    }
  }

  return null;
}

function traverseObject(obj, callback) {
  // 每个条目是一个对象和它的“路径”（例如 'a.b.c'）
  const stack = [{ value: obj, path: [] }];

  while (stack.length) {
    const { value, path } = stack.pop();

    // 如果值是对象或数组，就继续遍历
    if (value && typeof value === 'object') {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          const newPath = path.concat(key); // 更新当前路径
          stack.push({ value: value[key], path: newPath });
        }
      }
    }

    // 调用回调函数
    callback(path.join('.'), value);
  }
}

function main() {
  const vueRoot = findVueRoot(document.body);
  if (!vueRoot) {
    console.error("This website is not developed by Vue")
    return
  }

  let vueVersion;
  if (vueRoot.__vue__) {
    vueVersion = vueRoot.__vue__.$options._base.version;
  } else {
    vueVersion = vueRoot.__vue_app__.version;
  }

  console.log("Vue version is ", vueVersion)
  const routers = [];
  let routeRoot;

  try {
    if (/^2\./.test(vueVersion)) {
      if (vueRoot.__vue__.$root.$options.router.options.routes) {
        routeRoot = vueRoot.__vue__.$root.$options.router.options.routes
      } else if (vueRoot.__vue__._router.options.routes) {
        routeRoot = vueRoot.__vue__._router.options.routes
      }
    } else {
      routeRoot = vueRoot.__vue_app__.config.globalProperties.$router.options.routes
    }
  } catch (e) {}

  if (!routeRoot) {
    console.error("No Vue-Router detected")
    return
  }

  traverseObject(routeRoot, function (path, node) {
    if (typeof node.path === 'string') {
      routers.push(node)
    }
  })

  console.log(routers)
}

main()
