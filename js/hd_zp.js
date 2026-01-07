

let zpData = [];
let zpsData = [];
let nameData = [];
let peopleInfoData = [];
let peopleStory = [];
let peopleScore = [];

let currentData = [];

var chart = null;
const body = document.body;
var currentPage = null;
var addtype = null;
var isPopshow = false;
var isAllExpand = false;
var isAllowAll = false;
var isLevelTest = 89;
var currentName = '';
var currentZp = '';

const nameContainer = document.getElementById('names');
const toolbar = document.querySelector('.toolbar'); 
const zxpop = document.getElementById('pop-text');
const allpop = document.querySelectorAll('.pop');

const inputField = document.getElementById('inputField'); // 假设 inputField 有对应的 id
const zpinfo = document.getElementById('zpinfo');
const zxview = document.getElementById('poptext');
const namesPage = document.getElementById('pg-names');
const zpContent = document.getElementById('zps');
const zpPage = document.getElementById('pg-zps');
const sharedTooltip = document.getElementById('sharedTooltip');
const zptitle = document.getElementById('zptitle');
const zpcount = document.getElementById('zpcount');
const menu = document.getElementById('nodeContextMenu');



document.addEventListener('click', (e) => {
    const isClickInsideToolbar = toolbar.contains(e.target);
    const isClickOnResultItem = e.target.closest('.result-item');
    const isClickOnFilterbtn = e.target.closest('#zpfilter');
    const isClickOnpop = e.target.closest('.pop-box');
    const isClickOnNode = e.target.closest('.node-container');

    action = e.target.dataset.action;
    

    // if(isClickOnNodeadd){
    //     addnode();
    // }

    if (toolbar.classList.contains('extended') && 
        (isClickOnResultItem || !isClickInsideToolbar)) {
        toolbar.classList.remove('extended');
        inputField.value = '';
    }

    if(isClickOnFilterbtn){
        if (!toolbar.classList.contains('extended')){
            toolbar.classList.toggle('extended');
        }
        handleFilter();
    }

    
    if (menu.style.visibility === 'visible' && !menu.contains(e.target)) {
      hideTooltip('menu');
    }

    if(!isClickOnpop && !isClickOnNode){
        closePop();
    }

    loadNames();
    

    if(action){
        addtype = action;
        if (addtype === 'addChild') {
            nodeparent.value = window.currentNode.data.name;
            showPop(window.currentNode,'pop-form');
          } 
          else if (addtype === 'addSponse') {
            nodeparent.value = window.currentNode.parent.data.name;
            nodesponse.value = window.currentNode.data.name;
            showPop(window.currentNode,'pop-form');
          } 
        else if (addtype === 'addMoreInfo') {
            confirmNode(node);
          }else if (addtype === 'confirm') {
            
          }

          hideTooltip('menu');
    }
    hideTooltip('tip');
});

document.addEventListener('keydown', function(e) {

    if (e.key === 'Enter' && inputField.value.trim() !== '') {
        if (!toolbar.classList.contains('extended')){
            toolbar.classList.toggle('extended');
        }
        handleFilter();
    }

    const container = document.querySelector('.modal-container');
    if (e.key === 'Escape' && container.style.display === 'flex') {
        container.style.display = 'none';

    }
});

function mousein(type){
    if(type === 'zb'){
        
        const zibeiParts = zpsData[0]['zibei'].split(';');
        zpinfo.style = "height: 80%;width:240px;right:190px;font-family: LogoFont3,cursive;font-size:32px;"
        zpinfo.innerHTML = zibeiParts
            .filter(part => part.trim() !== '') // 过滤空字符串
            .map(part => `<p style="display:flex;align-items:center;justify-content:center;text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${part.trim()}</p>`) // 每个部分用p标签包裹
            .join(''); 
    }
}

function mouseout(type){
    zpinfo.innerHTML = '';
}
//---------------- page control ------------
function showPage(pageId){
    const pageBackgrounds = document.querySelectorAll('.page');
        pageBackgrounds.forEach(pageBg => {
        if (pageBg.id === pageId) {
            pageBg.style.display = 'flex'; // 或者'block'等其他显示方式
            currentPage = pageId;
        } else {
            pageBg.style.display = 'none';
        }
    });

    if(pageId !== "pg-index")
    {
        stopRendering();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const pgIndex = document.getElementById('pg-index');
    if (pgIndex && getComputedStyle(pgIndex).display !== 'none') {
      init(); 
    }
  });
//------------------- load -----------------
// 从CSV文件加载数据并初始化图表
function loadAndRenderFromCSV(csvPath,type) {
    return new Promise((resolve, reject) => {
        d3.csv(csvPath).then((data) => {
            if(type === 'names'){
                nameData = []; // 清空现有数据
                nameData = data; // 保存完整数据集
            }
            else if(type === 'zps'){
                zpsData = [];
                zpsData = data; // 保存完整数据集
            }
            else if(type === 'zptree')
            {
                zpData = [];
                zpData = data; // 保存完整数据集
                initOrgChart(data);
                chart.fit();
            }
            else if(type === 'story')  
            {
                peopleStory = [];
                peopleStory = data;
            }
            else if(type === 'score')  
            {
                peopleScore = [];
                peopleScore = data;
            }
            resolve(); // 数据加载完成
        }).catch(reject);
    });
}

function loadNames() {
    
    nameContainer.innerHTML = '';
    // 确保loadAndRenderFromCSV返回Promise
    loadAndRenderFromCSV('../data/xin.csv','names').then(() => {
        // 这里确保initOrgChart已完成，zpData有数据
        nameData.forEach(row => {
                    const newSection = document.createElement('div');
                    newSection.className = 'framecard framecard-name';
                    newSection.style.color = (!row['isEmpty'] || row['isEmpty'] === '0') ?'#000 ' : '#b83b5e';
                    newSection.innerHTML = `
                        <div class="framecard-frame">
                            <div class=" corner corner6 topleft" style="font-size:2.5px; "></div>
                            <div class="corner corner6 topright" style="font-size:2.5px; "></div>
                            <div class="corner corner6 bottomleft" style="font-size:2.5px; "></div>
                            <div class="corner corner6 bottomright" style="font-size:2.5px; "></div>
                            <span class="text-h">${row['name']}</span>
                        </div>
                            
                    `;


                    if(row['isEmpty'] && row['isEmpty'] !== '0'){
                        newSection.addEventListener('click', (e) => {
                            loadzps(e.currentTarget, row);
                        });
                    }
                    // 添加鼠标事件
                    newSection.addEventListener('mouseenter', (e) => {
                        showTooltip(e.currentTarget, row,'names');
                    });
                    
                    newSection.addEventListener('mouseleave', function(event) {
                        hideTooltip('tip');
                    });


                    nameContainer.appendChild(newSection);
                });
        // 可以添加其他依赖zpData的逻辑
    }).catch((error) => {
        console.error('加载CSV数据失败:', error);
    });
}

function loadzps(button, row){
    zpPage.style.display = 'flex';
    namesPage.style.display = 'none';
    zpContent.innerHTML = '';
    currentName = row['name'];

    loadAndRenderFromCSV(`../data/${currentName}/zps.csv`,'zps').then((data) => {

                zpsData.forEach(row => {
                    const newSection = document.createElement('div');
                    newSection.className = 'framecard framecard-zp';
                    newSection.innerHTML = `
                        <div class="framecard-frame">
                            <div class=" corner corner6 topleft" style="font-size:2.5px; "></div>
                            <div class="corner corner6 topright" style="font-size:2.5px; "></div>
                            <div class="corner corner6 bottomleft" style="font-size:2.5px; "></div>
                            <div class="corner corner6 bottomright" style="font-size:2.5px; "></div>
                            <span style="writing-mode: vertical-rl;text-orientation: upright;">${row['zpname']}</span>
                        </div>
                            
                    `;
                    
                    newSection.addEventListener('click', () => {
                        currentZp = row['zpname'];
                        loadZptree(newSection,row['name'],row['zpname']);
                    });
                    
                    zpContent.appendChild(newSection);
                });
        // 可以添加其他依赖zpData的逻辑
    }).catch((error) => {
        console.error('加载CSV数据失败:', error);
    });
}

function loadZptree(button,name,zpname)
{
    loadChart(button,name,zpname);
    showPage('pg-zptree');
}

async function loadZX() {
    zxfile = `../data/${currentName}/${currentZp}/zx.zp`;
    if (!zxfile) return;

    try {
        const response = await fetch(zxfile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text()
            .then(text => text.replace(/ /g, '　'))
            .then(text => text.replace(/\r\n/gm, '\n'))
            .then(text => text.replace(/([^\n])$/gm, '$1\n'))  // 确保每行结尾有换行
            .then(text => text.split('\n')
                .map(paragraph => 
                    paragraph.split('').join('') + 
                    '<div style="height:2em;"></div>'
                )
                .join(''));

                zxpop.style.display = 'flex';
        zxview.innerHTML = content;

    } catch (error) {
        console.error('获取文件内容时出错:', error);
    }
}

async function loadStory() {
    const storycontain = document.getElementById('story-contain');
    storycontain.innerHTML = '';
    const cid = window.currentNode.id;
    loadAndRenderFromCSV(`../data/${currentName}/${currentZp}/${cid}/story.csv`,'story').then((data) => {

                peopleStory.forEach(row => {
                    const newSection = document.createElement('div');
                    newSection.className = 'experience-content';
                    newSection.innerHTML = `
                        <div class="experience-time">
                            <span class="experience-rounder"></span>
                            <span class="experience-line"></span>
                        </div>

                        <div class="experience-data bd-grid">
                            <h3 class="experience-title">${row['storyName']}</h3>
                            <span class="experience-company" ><b>${row['year']}</b></span>
                            <p class="experience-description">${row['story']}</p>
                        </div>           
                    `;
                    
                    // newSection.addEventListener('click', () => {
                    //     loadZptree(newSection);
                    // });
                    
                    storycontain.appendChild(newSection);
                });
        // 可以添加其他依赖zpData的逻辑
    }).catch((error) => {
        console.error('加载CSV数据失败:', error);
    });
}

async function loadScore() {
    const storycontain = document.getElementById('story-contain');
    storycontain.innerHTML = '';
    const cid = window.currentNode.id;
    loadAndRenderFromCSV(`../data/${currentName}/${currentZp}/${cid}/score.csv`,'score').then((data) => {

                peopleScore.forEach(row => {
                    const newSection = document.createElement('div');
                    newSection.className = 'experience-content';
                    newSection.innerHTML = `
                        <div class="experience-time">
                            <span class="experience-rounder"></span>
                            <span class="experience-line"></span>
                        </div>

                        <div class="experience-data bd-grid">
                            <h3 class="experience-title">${row['who']}</h3>
                            <p class="experience-description">${row['content']}</p>
                        </div>           
                    `;
                    
                    // newSection.addEventListener('click', () => {
                    //     loadZptree(newSection);
                    // });
                    
                    storycontain.appendChild(newSection);
                });
        // 可以添加其他依赖zpData的逻辑
    }).catch((error) => {
        console.error('加载CSV数据失败:', error);
    });
}

async function loadMoreInfo() {
    show_nodedeImage.src=window.currentNode.data.photo ? `../data/${currentName}/${currentZp}/` + window.currentNode.data.photo : '../resources/long_bt.png';
    show_nodename.innerHTML = window.currentNode.data.name;
    show_nodelevel.innerHTML = "第"+numberToChinese(window.currentNode.data.level)+"代";
    show_nodesucess.innerHTML = window.currentNode.data.success;
    loadStory();
    show_nodeborn.innerHTML = window.currentNode.data.born;
    show_nodeend.innerHTML = window.currentNode.data.dead;
}
//------------------- tooltip -----------------
function showPop(node,type) {

    allpop.forEach(pop => {
        const elementId = pop.id;
        if(elementId === type){
            pop.style.display = 'flex'; // 或者'block'等其他显示方式
            if(elementId === 'pop-show')
            {
                loadMoreInfo();
            }
        }else{
            pop.style.display = 'none';
        };
    });
}

function closePop(){
    allpop.forEach(pop => {
        if(pop.style.display === 'flex'){
            pop.style.display = 'none'; // 或者'block'等其他显示方式
        }
    });
}

function showTooltip(button,  row, type) {
    if(type === 'names'){
        const count = (!row['isEmpty'] || row['isEmpty'] === '0') ? '0' : `${row['isEmpty']}`;
        sharedTooltip.innerHTML = `
        <div style="--grain-china-corner-color: black;">
            <div class="corner corner2 topleft"></div>
            <div class="corner corner2 topright"></div>
            <div class="corner corner2 bottomleft"></div>
            <div class="corner corner2 bottomright"></div>
            <h1 style="text-align: center;color:#522546;">${row['name']}</h1>
            <p style="text-align: center;color:#522546;">(${row['read']})</p>
            <p style="line-height: 1.5em;">
                <b>人口数量:</b>   ${row['total']}<br>
                <b>姓氏来源:</b>   ${row['source']}<br>
                <b>地区分布:</b>   ${row['field']}<br>
                <b>族谱收录:</b>   ${count}本
            </p>
        </div>
    `;
    }
    else if(type === 'nodes'){
        const level = numberToChinese(row.data.level);

        sharedTooltip.innerHTML = `
        <div style="--grain-china-corner-color: black;">
            <div class="corner corner2 topleft"></div>
            <div class="corner corner2 topright"></div>
            <div class="corner corner2 bottomleft"></div>
            <div class="corner corner2 bottomright"></div>
            <div class="image-container" style="display: flex; justify-content: center;">
                <img class="profile-image" 
                    src="${row.data.photo ? `../data/${currentName}/${currentZp}/` + row.data.photo : '../resources/long_bt.png'}" 
                    alt="用户头像" />
            </div>
            <h1 class="profile-name" style="text-align: center;">
                ${row.data.name}
            </h1>
            <p class="profile-level" style="text-align: center;">
                (第${row.data.level}代)
            </p>
            <p class="profile-success">
                ${row.data.success}
            </p>
            <p class="profile-local">
                ${row.data.local}
            </p>
            <p class="profile-description">
                ${row.data.simpleStory}
            </p>
        </div>
        `;
    }
    // 更新 Tooltip 内容

    
    // 先显示 Tooltip 以获取尺寸
    sharedTooltip.style.opacity = '1';
    sharedTooltip.style.visibility = 'visible';
    
    // 获取元素位置信息
    const buttonRect = (type === 'names')?button.getBoundingClientRect():button;
    // const buttonRect2 = button.currentTarget.getBoundingClientRect();
    const tooltipRect = sharedTooltip.getBoundingClientRect();
    
    // 视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 计算初始位置（优先显示在上方中间）
    let left = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);
    let top = buttonRect.top - tooltipRect.height - 10;
    let position = 'top'; // 默认在上方
    
    // 检查上方空间是否足够
    if (top < 10) {
        // 上方空间不足，改为显示在下方
        top = buttonRect.bottom + 10;
        position = 'bottom';
    }
    
    // 检查左右边界
    if (left < 10) {
        // 左侧越界，向右调整
        left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
        // 右侧越界，向左调整
        left = viewportWidth - tooltipRect.width - 10;
    }
    
    // 应用最终位置
    sharedTooltip.style.left = `${left}px`;
    sharedTooltip.style.top = `${top}px`;
    
    // 设置箭头方向
    sharedTooltip.className = 'tooltip basic-theme';
    sharedTooltip.classList.add(position);
  
  }
  
  // 3. 隐藏 Tooltip
  function hideTooltip(type) {
    if(type === 'tip' && sharedTooltip.style.visibility === 'visible'){
        sharedTooltip.style.opacity = '0';
        sharedTooltip.style.visibility = 'hidden';
    }
    else if(type === 'menu' && menu.style.visibility === 'visible'){
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
    }

  }
  
  // 4. 窗口大小变化时重新定位
  window.addEventListener('resize', () => {
    if (sharedTooltip.style.visibility === 'visible') {
        // 可以在这里添加重新定位逻辑
    }
  });

//   ------------------------ tree control -------------------------------------------
async function loadChart(triggerElement,name,zpname) {
  try {
    // 显示加载状态
    showLoading('正在生成家族树。。。');

    const cardText = triggerElement.textContent
      .replace(/<[^>]*>/g, '') // 移除所有HTML标签
      .replace(/\s+/g, ' ') // 将多个空格合并为一个
      .trim(); // 去除首尾空格

    // 等待数据加载和渲染完成
    await loadAndRenderFromCSV(`../data/${name}/${zpname}/zp.csv`, 'zptree');
    
    // 这里确保initOrgChart已完成，zpData有数据
    if (zptitle) {
      zptitle.innerHTML = cardText;
    }
    if (zpcount) {
        const maxLevel = d3.max(zpData, (row) => {
            // 转为数值，若无效则返回null（d3.max会自动忽略null）
            const level = Number(row.level);
            return isNaN(level) ? null : level;
          });

      zpcount.innerHTML = "收录" + numberToChinese(maxLevel) + "代";
    }
    // 可以添加其他依赖zpData的逻辑
    
  } catch (error) {
    console.error('加载CSV数据失败:', error);
    alert('加载数据失败，请重试');
  } finally {
    // 无论成功或失败都隐藏加载状态
    // hideLoading();
  }
}

async function zp_all() {
    try {
        // 显示加载状态
        showLoading('正在展开整个家族树，展开后不可编辑。。。');
        
        // 使用微任务延迟执行，给渲染引擎时间绘制加载动画
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // 执行展开操作
        if(currentData.length > 0)
        {
            currentData = [];
            await initOrgChart(zpData);
        }
        await chart.expandAll().fit();
        
    } catch (error) {
        console.error('展开所有节点失败:', error);
        alert('展开操作失败，请重试');
    } finally {
        isAllExpand = true;
        hideLoading();
    }
}

// 绘制家族树
// 显示加载状态
function showLoading(text) {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'chart-loading';
  loadingOverlay.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p><b>${text}</b></p>
    </div>
  `;
  document.body.appendChild(loadingOverlay);
  
  // 添加 CSS 样式
  const style = document.createElement('style');
  style.textContent = `
    #chart-loading {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: black(4px);
      transition: opacity 0.3s ease;
    }
    .loading-spinner {
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #000;
      border-top: 4px solid #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// 隐藏加载状态
function hideLoading() {
  const loadingOverlay = document.getElementById('chart-loading');
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(loadingOverlay);
    }, 300);
  }
}

async function setAllow() {
    if(isAllowAll === false)
    {   
        showLoading();
        try {
            
            isAllowAll = true;
            await renderFromSubset(currentData);
            chart.fit();
            
        } catch (error) {
            console.error('展开所有节点失败:', error);
            alert('展开操作失败，请重试');
        } finally {
            hideLoading();
        }
    }
}

async function initOrgChart(data) {
  try {
    // 显示加载状态
    // showLoading();
    
    // 使用 Promise 包装耗时操作
    await new Promise((resolve) => {
      // 原函数代码
      const [spouses, nonSpouses] = data.reduce(
        (acc, item) => {
          acc[item.isSpouse === "1" ? 0 : 1].push(item);
          return acc;
        },
        [[], []] // 初始值：[配偶组, 非配偶组]
      );

      chart = new d3.OrgChart()
        .compact(false)
        .nodeHeight((d) => 148 + 2)
        .nodeWidth((d) => 25 + 2)
        .childrenMargin((d) => 50)
        .compactMarginBetween((d) => 35)
        .compactMarginPair((d) => 30)
        .neighbourMargin((a, b) => 20)
        .nodeUpdate(function() {
          d3.select(this).select('.node-rect').attr('stroke', 'none');
        })
        .nodeContent(function(d, i, arr, state) {
          const color = d.data.sex === "1" ? "#6a2c70" : "#112d4e";
          const textColor = d.data.sex === "1" ? "#ffc7c7" : "rgba(255,255,255,0.3)";
          const warningIcon = d.data.ischeck === "1" ? "<div class='warning-icon'>!</div>"  : "";
          const titleColor = "#000";
          const imageDiffVert = 25;
            const nodeContent = (isAllowAll || d.data.level < isLevelTest)
                ? d.data.name 
                : "需授权";

          return `
            <div class="node-container" style="--width: ${d.width}; --height: ${d.height}; --imageDiffVert: ${imageDiffVert};">
            ${warningIcon}
                <div class="node-card ${d.data._highlighted || d.data._upToTheRootHighlighted ? 'highlighted' : ''}"  data-node-id="${d.data.id}">
                
                    <!-- 上层装饰 -->
                    <div class="node-decor-top">
                        <svg viewBox="0 0 ${d.width} 15">
                            <path fill="${textColor}" d="M0 0 H${d.width} V10 H0 Z"/>
                            <path fill="${textColor}" d="M0 8 L${d.width/2} 8 L0 15 Z"/>
                            <path fill="${textColor}" d="M${d.width} 8 L${d.width/2} 8 L${d.width} 15 Z"/>
                        </svg>
                    </div>
                    
                    <!-- 内容区域 -->
                    <div class="node-content" style="--textColor: ${titleColor}">
                        ${nodeContent}
                    </div>

                    <!-- 下层装饰 -->
                    <div class="node-decor-bottom">
                        <svg viewBox="0 0 ${d.width} 15">
                            <path fill="${textColor}" d="M0 ${d.height-5} H${d.width} V5 H0 Z"/>
                            <path fill="${textColor}" d="M0 0 L0 7 L${d.width/2} 7 Z"/>
                            <path fill="${textColor}" d="M${d.width} 0 L${d.width} 7 L${d.width/2} 7 Z"/>
                        </svg>
                    </div>
                </div>

                <div class="node-card">
                    <!-- 节点内容 -->
                </div>
                  `;
        })
        .container('.chart-container')
        .onNodeClick(function(d) {
          window.currentNode = d;
            if(!isAllExpand){
                chart.clearHighlighting();
                chart.setHighlighted(d.data.id).render();
            }
          if(d.data.moreinfo === '1')
              showPop(d,'pop-show');
          return false;
        })
        .onNodeRClick(function(d) {
            if(!isAllExpand){
                chart.clearHighlighting();
                chart.setHighlighted(d.data.id).render();
            
            
                window.currentNode = d;
                menu.style.left = `${event.clientX}px`;
                menu.style.top = `${event.clientY}px`;
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
            }
          return false;
        })
        .onNodeMouseEnter(function(event,d) {
          showTooltip(event,d,'nodes');
        })
        .onNodeMouseLeave(function(event,d) {
          hideTooltip('tip');
        })
        .data(nonSpouses)
        .render();

      spouses.forEach((d) => {
        chart.insertNodeBefore(d, d.spouseId);
      });

      chart.render();
      
      // 处理完成后 resolve
      resolve();
    });
    
  } catch (error) {
    console.error('关系图渲染失败:', error);
    alert('关系图渲染失败，请重试');
  } finally {
    // 无论成功或失败都隐藏加载状态
    hideLoading();
  }
}

// ------------------------ tools ----------------------------------------
function numberToChinese(num) {
    const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const chineseUnits = ['', '十', '百', '千', '万'];
    
    if (num === 0) return chineseNums[0];
    
    let result = '';
    let unitPos = 0;
    
    while (num > 0) {
      const digit = num % 10;
      if (digit !== 0) {
        result = chineseNums[digit] + chineseUnits[unitPos] + result;
      } else if (result.length > 0 && result[0] !== chineseNums[0]) {
        result = chineseNums[0] + result;
      }
      num = Math.floor(num / 10);
      unitPos++;
    }
    
    // 处理"一十"开头的特殊情况
    if (result.startsWith('一十')) {
      result = result.substring(1);
    }
    
    return result;
  }

  // ------------------------ data  ----------------------------------------