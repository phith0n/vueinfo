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

function findVueRouter(vueRoot) {
  let router;

  try {
    if (vueRoot.__vue_app__) {
      router = vueRoot.__vue_app__.config.globalProperties.$router.options.routes
    } else {
      if (vueRoot.__vue__.$root.$options.router.options.routes) {
        router = vueRoot.__vue__.$root.$options.router.options.routes
      } else if (vueRoot.__vue__._router.options.routes) {
        router = vueRoot.__vue__._router.options.routes
      }
    }
  } catch (e) {}

  return router
}

function walkRouter(rootNode, callback) {
  // 每个条目是一个对象和它的“路径”（例如 'a.b.c'）
  const stack = [{node: rootNode, path: ''}];

  while (stack.length) {
    const { node, path} = stack.pop();

    // 如果值是对象或数组，就继续遍历
    if (node && typeof node === 'object') {
      for (const key in node) {
        if (node.hasOwnProperty(key)) {
          stack.push({node: node[key], path: (path ? path + '/' : '') + node[key].path});
        }
      }
    }

    // 调用回调函数
    callback(path, node);
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

  const vueRouter = findVueRouter(vueRoot)
  if (!vueRouter) {
    console.error("No Vue-Router detected")
    return
  }

  walkRouter(vueRouter, function (path, node) {
    if (node.path) {
      node.path = path
      routers.push(node)
    }
  })

  console.table(routers)
}

main()
