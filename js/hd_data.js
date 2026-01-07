const nodename = document.getElementById('node-name');
const nodesex = document.getElementById('node-sex');
const nodeparent = document.getElementById('node-parent');
const nodesponse = document.getElementById('node-sponse');
const nodesucess = document.getElementById('node-sucess');
const nodeborn = document.getElementById('node-born');
const nodeend = document.getElementById('node-end');
const nodedescription = document.getElementById('node-description');
const nodedeImage = document.getElementById('node-Image');

const show_nodename = document.getElementById('show-node-name');
const show_nodelevel = document.getElementById('show-node-level');
const show_nodesucess = document.getElementById('show-node-sucess');
const show_nodeborn = document.getElementById('show-node-born');
const show_nodeend = document.getElementById('show-node-end');
const show_nodedescription = document.getElementById('show-node-description');
const show_nodedeImage = document.getElementById('show-node-Image');


const container = document.querySelector('.pop-container');
container.addEventListener('wheel', (e) => {
  e.preventDefault(); // 阻止默认纵向滚动
  container.scrollBy({ left: e.deltaY > 0 ? 30 : -30 }); // 滚轮上下 -> 横向滚动
});

function addnode(event){
    event.preventDefault(); 
    const node = window.currentNode; 
    const newRow = {
      id: Date.now().toString(), // 使用时间戳生成唯一ID
      name: nodename.value,
      level:addtype === 'addChild'?parseInt(node.data.level)+1:parseInt(node.data.level),
      parentId:addtype === 'addChild'?node.data.id:node.data.parentId,
      spouseId:addtype === 'addChild'?'':node.data.id,
      isSpouse:addtype === 'addChild'?'':'1',
      otherName:'',
      relation:'',
      local:'',
      success:nodesucess.value,
      simpleStory:nodedescription.value,
      databaseId:'',
      out_spouseId:'',
      state:'',
      photo:nodedeImage.value,
      moreinfo:'',
      born:nodeborn.value,
      dead:nodeend.value,
      sex:addtype === 'addChild'?'':'1',
      ischeck:'',
    };
    

    if(addtype === 'addChild'){
        chart.addNode(newRow).render();
    }
    else if(addtype ==='addSponse'){
        chart.insertNodeBefore(newRow,node.data.id).render();
    }
    closePop();
}



function handleFilter() {
    const inputField = document.getElementById('inputField');
    const filterBtn = document.getElementById('filterBtn');
    // const resultList = document.getElementById('resultList');
    const resultList = document.querySelector('.result-list');
    const inputContainer = document.querySelector('.card_container');

    const inputValue = inputField.value.trim();

    if(isAllExpand === true){
      chart.collapseAll().fit();
      isAllExpand = false;
    }
    
    
    let filteredData = [];
    // 判断输入是否为数字
    if (/^[0-9]+$/.test(inputValue)) {
        filteredData = zpData.filter(item => 
            String(item.level).toLowerCase()===inputValue.toLowerCase()
            
        );
    }
    else{
      if(inputValue == '授权')setAllow();
        filteredData = zpData.filter(item => 
            item.name.toLowerCase().includes(inputValue.toLowerCase())
        );
    }

    // 文字筛选逻辑
    if (filteredData.length > 0) {
        // chart.initTreeLevel(4);
        // 生成结果列表
        resultList.innerHTML = filteredData.map(item => `
            <div class="result-item" onclick="generateSubtree(${item.id})">
                <span class="result-name">${item.name}</span>
                <span class="result-level">第${item.level}代</span>
                <span class="result-number">${countChildNodes(item.id)}</span>
            </div>
        `).join('');

        resultList.classList.add('active'); // 显示列表

    } else {
        if (resultList) {
            resultList.classList.remove('active'); // 清空输入时隐藏列表
            resultList.innerHTML = '';
        }
        if (inputContainer) {
            inputContainer.style.transform = 'translateY(0)'; // 恢复位置
        }
        console.log(`else`);
    }
    inputValue.value = '';
}

// 从现有数据子集渲染图表
function renderFromSubset(subsetData) {
    initOrgChart(subsetData);
}

// 计算指定节点的子节点数量
function countChildNodes(nodeId) {
  return zpData.filter(node => node.parentId === nodeId).length;
}

function findGrandparentNode(nodeId, times) {
  let currentId = String(nodeId);
  
  for (let i = 0; i < times; i++) {
    const node = zpData.find(node => node.id === currentId);
    if (!node || !node.parentId) {
      return null; // 找不到父节点时提前返回
    }
    currentId = node.parentId;
  }
  
  return currentId;
}

// 显示子树
function showSubtree(nodeId) {
    currentData = [];
    currentData = extractSubtree(zpData, nodeId);
    renderFromSubset(currentData);
    chart.setCentered(String(nodeId)).render();
    chart.fit();
    chart.setHighlighted(String(searchId)).render()
}

// 根据输入框ID生成子树
function generateSubtree(nodeId) {
    const resultList = document.querySelector('.result-list');
    const inputContainer = document.querySelector('.card_container');
    const toolbar = document.querySelector('.toolbar');

    searchId = nodeId;

    if (nodeId) {
        const gr = findGrandparentNode(nodeId,2);
        if(gr)
            showSubtree(gr);
        else    
            showSubtree(nodeId);

    } else {
        // alert('请输入有效的节点ID');
    }
 
    if (resultList) {
        resultList.classList.remove('active'); // 清空输入时隐藏列表
        resultList.innerHTML = '';
    }
    if (inputContainer) {
        inputContainer.style.transform = 'translateY(0)'; // 恢复位置
    }
}

// 提取子树 - 只包含给定节点及其子孙节点
function extractSubtree(data, rootId) {
    const stringRootId = String(rootId);
    const rootNode = data.find(d => d.id === stringRootId);
    if (!rootNode) {
        console.warn(`未找到ID为${rootId}的节点`);
        return data;
    }
    
    // 创建根节点的深拷贝并初始化所有布局属性
    const rootNodeCopy = JSON.parse(JSON.stringify(rootNode));
    rootNodeCopy.parentId = null;
    
    // 初始化所有D3需要的布局属性
    const layoutProps = ['x0', 'y0', 'x', 'y', '_x', '_y', 'width', 'height'];
    layoutProps.forEach(prop => {
        rootNodeCopy[prop] = prop.includes('width') ? 25 + 2 : 
                            prop.includes('height') ? 138 + 2 : 0;
    });
    
    const subtree = [rootNodeCopy];
    const queue = [rootNodeCopy];
    
    while (queue.length > 0) {
        const currentNode = queue.shift();
        const children = data.filter(d => d.parentId === currentNode.id);
        children.forEach(child => {
            const childCopy = JSON.parse(JSON.stringify(child));
            // 初始化子节点的所有布局属性
            layoutProps.forEach(prop => {
                childCopy[prop] = prop.includes('width') ? 25 + 2 : 
                                 prop.includes('height') ? 138 + 2 : 0;
            });
            subtree.push(childCopy);
            queue.push(childCopy);
        });
    }
    return subtree;
}

// ============hill================
class Plane {
  constructor() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0 
      }
    };

    this.mesh = this.createMesh();
    this.time = 1;
  }
  
  createMesh() {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(256, 256, 256, 256),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: "#define GLSLIFY 1\nattribute vec3 position;\n\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nuniform float time;\n\nvarying vec3 vPosition;\n\nmat4 rotateMatrixX(float radian) {\n  return mat4(\n    1.0, 0.0, 0.0, 0.0,\n    0.0, cos(radian), -sin(radian), 0.0,\n    0.0, sin(radian), cos(radian), 0.0,\n    0.0, 0.0, 0.0, 1.0\n  );\n}\n\n//\n// GLSL textureless classic 3D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-10-11\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x)\n{\n  return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec3 fade(vec3 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise(vec3 P)\n{\n  vec3 Pi0 = floor(P); // Integer part for indexing\n  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n  Pi0 = mod289(Pi0);\n  Pi1 = mod289(Pi1);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 * (1.0 / 7.0);\n  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 * (1.0 / 7.0);\n  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\nvoid main(void) {\n  vec3 updatePosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;\n  float sin1 = sin(radians(updatePosition.x / 128.0 * 90.0));\n  vec3 noisePosition = updatePosition + vec3(0.0, 0.0, time * -30.0);\n  float noise1 = cnoise(noisePosition * 0.08);\n  float noise2 = cnoise(noisePosition * 0.06);\n  float noise3 = cnoise(noisePosition * 0.4);\n  vec3 lastPosition = updatePosition + vec3(0.0,\n    noise1 * sin1 * 8.0\n    + noise2 * sin1 * 8.0\n    + noise3 * (abs(sin1) * 2.0 + 0.5)\n    + pow(sin1, 2.0) * 40.0, 0.0);\n\n  vPosition = lastPosition;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(lastPosition, 1.0);\n}\n",
        fragmentShader: "precision highp float;\n#define GLSLIFY 1\n\nvarying vec3 vPosition;\n\nvoid main(void) {\n  float opacity = (96.0 - length(vPosition)) / 256.0 * 0.6;\n  vec3 color = vec3(0.6);\n  gl_FragColor = vec4(color, opacity);\n}\n",
        transparent: true 
      })
    );
  }
  
  render(time) {
    this.uniforms.time.value += time * this.time;
  }
}

let renderer, scene, camera, clock, plane;
let animationId = null;
let isRendering = false;

const canvas = document.getElementById('canvas-webgl');

renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: canvas 
});

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
clock = new THREE.Clock();

plane = new Plane();

const resizeWindow = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const on = () => {
  // 监听窗口大小变化
  $(window).on('resize', () => {
    resizeWindow();
  });
};


const render = () => {
  if (!isRendering) return;
  
  plane.render(clock.getDelta());
  renderer.render(scene, camera);
  animationId = requestAnimationFrame(render);
};

const startRendering = () => {
  if (isRendering) return;
  
  isRendering = true;
  clock.start(); // 重新启动时钟
  render();
  console.log('Three.js渲染已启动');
};

const stopRendering = () => {
  if (!isRendering) return;
  
  isRendering = false;
  cancelAnimationFrame(animationId);
  clock.stop(); // 停止时钟计时
  console.log('Three.js渲染已停止');
};

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xeeeeee, 1.0);
  camera.position.set(0, 16, 128);
  camera.lookAt(new THREE.Vector3(0, 28, 0));

  scene.add(plane.mesh);

  on();
  resizeWindow();
  startRendering(); // 使用新的启动函数
};

// -------------------------------------
// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————

const phrases = [
  "族谱新时尚",
  "修谱更简单",
  "难得文化",
  "难得的企业",
  "难得的事业"
];

const el = document.querySelector(".index-text");
const fx = new TextScramble(el);

let counter = 0;
const next = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next, 800);
  });
  counter = (counter + 1) % phrases.length;
};

next();
