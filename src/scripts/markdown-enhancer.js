/**
 * Markdown 增强脚本 - 自动转换主题化文本为 blockquote
 * 检测 **tip:**、**warning:** 等模式并转换为主题化的 blockquote
 */

// 主题映射配置
const THEME_PATTERNS = [
  {
    patterns: ['tip:', 'tips:', '提示：', '💡'],
    theme: 'info',
    icon: '💡',
    label: '提示'
  },
  {
    patterns: ['success:', 'ok:', '成功：', '✅'],
    theme: 'success', 
    icon: '✅',
    label: '成功'
  },
  {
    patterns: ['warning:', 'warn:', 'caution:', '警告：', '注意：', '⚠️'],
    theme: 'warning',
    icon: '⚠️', 
    label: '警告'
  },
  {
    patterns: ['error:', 'danger:', 'fail:', '错误：', '失败：', '❌'],
    theme: 'error',
    icon: '❌',
    label: '错误'
  }
];

/**
 * 检测文本是否匹配主题模式
 * @param {string} text - 要检测的文本
 * @returns {Object|null} - 匹配的主题信息或 null
 */
function detectTheme(text) {
  const lowerText = text.toLowerCase().trim();
  
  for (const themeConfig of THEME_PATTERNS) {
    for (const pattern of themeConfig.patterns) {
      if (lowerText.startsWith(pattern.toLowerCase())) {
        return {
          ...themeConfig,
          matchedPattern: pattern,
          remainingText: text.slice(pattern.length).trim()
        };
      }
    }
  }
  
  return null;
}

/**
 * 创建主题化的 blockquote 元素
 * @param {Object} themeInfo - 主题信息
 * @param {string} content - 内容文本
 * @returns {HTMLElement} - 创建的 blockquote 元素
 */
function createThemedBlockquote(themeInfo, content) {
  const blockquote = document.createElement('blockquote');
  blockquote.setAttribute('data-theme', themeInfo.theme);
  
  // 创建标题部分
  const title = document.createElement('strong');
  title.textContent = `${themeInfo.icon} ${themeInfo.label}：`;
  
  // 创建内容段落
  const paragraph = document.createElement('p');
  paragraph.appendChild(title);
  
  // 如果有剩余文本，添加到段落中
  if (themeInfo.remainingText) {
    paragraph.appendChild(document.createTextNode(' ' + themeInfo.remainingText));
  }
  
  blockquote.appendChild(paragraph);
  
  return blockquote;
}

/**
 * 处理文本节点中的主题化模式
 * @param {Node} textNode - 文本节点
 */
function processTextNode(textNode) {
  const text = textNode.textContent;
  const strongRegex = /\*\*(.*?)\*\*/g;
  
  let match;
  const replacements = [];
  
  while ((match = strongRegex.exec(text)) !== null) {
    const strongContent = match[1];
    const themeInfo = detectTheme(strongContent);
    
    if (themeInfo) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        themeInfo: themeInfo,
        content: themeInfo.remainingText || strongContent
      });
    }
  }
  
  // 如果找到了匹配项，进行替换
  if (replacements.length > 0) {
    const parent = textNode.parentNode;
    const fragment = document.createDocumentFragment();
    
    let lastIndex = 0;
    
    replacements.forEach(replacement => {
      // 添加匹配前的文本
      if (replacement.start > lastIndex) {
        const beforeText = text.slice(lastIndex, replacement.start);
        if (beforeText.trim()) {
          fragment.appendChild(document.createTextNode(beforeText));
        }
      }
      
      // 创建并添加主题化的 blockquote
      const blockquote = createThemedBlockquote(replacement.themeInfo, replacement.content);
      fragment.appendChild(blockquote);
      
      lastIndex = replacement.end;
    });
    
    // 添加最后剩余的文本
    if (lastIndex < text.length) {
      const afterText = text.slice(lastIndex);
      if (afterText.trim()) {
        fragment.appendChild(document.createTextNode(afterText));
      }
    }
    
    // 替换原始文本节点
    parent.replaceChild(fragment, textNode);
  }
}

/**
 * 遍历并处理所有文本节点
 * @param {Node} node - 要处理的节点
 */
function processNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    processTextNode(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // 避免处理已经是 blockquote 的元素
    if (node.tagName !== 'BLOCKQUOTE' && node.tagName !== 'CODE' && node.tagName !== 'PRE') {
      // 转换为数组以避免在遍历时修改集合
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach(child => processNode(child));
    }
  }
}

/**
 * 初始化 Markdown 增强功能
 */
function initMarkdownEnhancer() {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processMarkdown);
  } else {
    processMarkdown();
  }
}

/**
 * 处理页面中的 Markdown 内容
 */
function processMarkdown() {
  // 查找文章内容容器
  const articleContainer = document.querySelector('.article-content');
  
  if (articleContainer) {
    processNode(articleContainer);
    console.log('Markdown 主题化处理完成');
  }
}

// 导出函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initMarkdownEnhancer,
    processMarkdown,
    detectTheme,
    createThemedBlockquote
  };
}

// 自动初始化
initMarkdownEnhancer();