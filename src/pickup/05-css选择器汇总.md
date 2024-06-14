# css选择器

- [css选择器](#css选择器)
  - [1. 基本选择器](#1-基本选择器)
    - [1.1 通配选择器](#11-通配选择器)
    - [1.2 元素选择器](#12-元素选择器)
    - [1.3. 类选择器](#13-类选择器)
    - [1.4. ID选择器](#14-id选择器)
  - [2. 复合选择器](#2-复合选择器)
    - [2.1 交集选择器](#21-交集选择器)
    - [2.2 并集选择器](#22-并集选择器)
    - [2.3. 后代选择器](#23-后代选择器)
    - [2.4. 子代选择器](#24-子代选择器)
    - [2.5. 相邻兄弟选择器](#25-相邻兄弟选择器)
    - [2.6. 属性选择器](#26-属性选择器)
      - [2.6.1. 简单属性选择](#261-简单属性选择)
      - [2.6.2. 根据具体属性值选择](#262-根据具体属性值选择)
    - [2.7. 伪类](#27-伪类)
      - [2.7.1. 锚伪类](#271-锚伪类)
      - [2.7.2. 结构伪类](#272-结构伪类)
    - [2.8. 伪元素](#28-伪元素)
      - [2.8.1. `"first-line"`伪元素](#281-first-line伪元素)
      - [2.8.2. `:first-letter`伪元素](#282-first-letter伪元素)
      - [2.8.3. `:before`伪元素](#283-before伪元素)
      - [2.8.4. `after`伪元素](#284-after伪元素)
  - [3. 选择器权重](#3-选择器权重)

![selector](../assets/css_selector.gif)

## 1. 基本选择器

### 1.1 通配选择器

```css
/* 选中所有元素 */
* {
  color: orange;
  font-size: 40px;
}
```

### 1.2 元素选择器

文档的元素就是元素选择器,是最基本的选择器

```css
html { color:black; }
h1 { color:blue; }
h2 { color:silver; }
```

### 1.3. 类选择器

类选择器允许以一种独立于文档元素的方式来指定样式.

```html
<h1 class="important">
This heading is very important.
</h1>
```

```css
.important {color:red;}
```

### 1.4. ID选择器

ID选择器允许以一种独立于文档元素的方式来指定样式

```html
<p id="intro">This is a paragraph of introduction.</p>
```

```css
#intro {font-weight:bold;}
```

## 2. 复合选择器

### 2.1 交集选择器

选中同时符合多个条件的元素

```css
/* 选中：类名为beauty的p元素，为此种写法用的非常多！！！！ */
p.beauty {
  color: blue;
}
/* 选中：类名包含rich和beauty的元素 */
.rich.beauty {
  color: green;
}
```

### 2.2 并集选择器

选中多个选择器对应的元素(`以','分隔`)，被分组的选择器就可以分享相同的声明, 又称：分组选择器

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  color: green;
}
```

### 2.3. 后代选择器

后代选择器可以选择作为某元素后代的元素(`以空格分隔`)

```css
h1 em {color:red;}
```

### 2.4. 子代选择器

与后代选择器相比, 子元素选择器只能选择作为某元素子元素的元素(`以>分隔`).

```css
h1 > strong {color:red;}
```

### 2.5. 相邻兄弟选择器

相邻兄弟选择器 (Adjacent sibling selector) 可选择**紧接**在另一元素后的元素, 且二者有相同父元素(`以+分隔`).

```css
h1 + p {margin-top:50px;}
```

### 2.6. 属性选择器

属性选择器可以根据元素的属性及属性值来选择元素.

#### 2.6.1. 简单属性选择

如果您希望把包含标题 (title) 的所有元素变为红色, 可以写作:

```css
*[title] {color:red;}  // 把包含标题 (title) 的所有元素变为红色
a[href] {color:red;} // 只对有 href 属性的锚 (a 元素) 应用样式
a[href][title] {color:red;} // 将同时有 href 和 title 属性的 HTML 超链接的文本设置为红色
img[alt] {border: 5px solid red;} // 所有带有 alt 属性的图像应用样式, 从而突出显示这些有效的图像
```

#### 2.6.2. 根据具体属性值选择

```css
a[href="http://www.w3school.com.cn/"][title="W3School"] {color: red;} // 把多个属性-值选择器链接在一起来选择一个文档
p[class="important warning"] {color: red;} // 根据具体属性值来选择该元素
```

| 选择器                                                       | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| [[*attribute*\]](https://www.w3school.com.cn/cssref/selector_attribute.asp) | 选取带有`attribute`属性的元素.                                |
| [[*attribute*=*value*\]](https://www.w3school.com.cn/cssref/selector_attribute_value.asp) | 选取`attribute`属性值为`value`的元素.                           |
| [[*attribute*~=*value*\]](https://www.w3school.com.cn/cssref/selector_attribute_value_contain.asp) | 选取`attribute`属性值中包含`value`的元素.                       |
| [[*attribute*\|=*value*\]](https://www.w3school.com.cn/cssref/selector_attribute_value_start.asp) | 选取`attribute`属性值等于`value`或`value`开头的元素, 该值必须是整个单词. |
| [[*attribute*^=*value*\]](https://www.w3school.com.cn/cssref/selector_attr_begin.asp) | 选取`attribute`属性值`value`开头的每个元素.                     |
| [[*attribute*$=value]](https://www.w3school.com.cn/cssref/selector_attr_end.asp) | 选取`attribute`属性值value结尾的每个元素.                     |
| [[attribute*=value]](https://www.w3school.com.cn/cssref/selector_attr_contain.asp) | 选取`attribute`属性值包含`value`的每个元素.                     |

### 2.7. 伪类

伪类用于向某些选择器添加特殊的效果

```css
selector : pseudo-class {property: value}
```

#### 2.7.1. 锚伪类

```css
a:link {color: #FF0000}    /* 未访问的元素 */
a:visited {color: #00FF00}  /* 已访问的元素 */
a:hover {color: #FF00FF}  /* 鼠标悬停在元素上 */
a:active {color: #0000FF}  /* 激活的元素 */
a:focus {color: #0000FF}  /* 获取焦点的元素 */
```

#### 2.7.2. 结构伪类

- `:first-child` 所有兄弟元素中的**第一个**.
- `:last-child` 所有兄弟元素中的**最后一个**.
- `:nth-child(n)` 所有兄弟元素中的**第 n 个**.
- `:first-of-type` 所有同类型兄弟元素中的**第一个**.
- `:last-of-type` 所有同类型兄弟元素中的**最后一个**.
- `:nth-of-type(n)` 所有同类型兄弟元素中的**第n个**.
- `:nth-last-child(n)` 所有兄弟元素中的**倒数第n个**.
- `:nth-last-of-type(n)` 所有同类型兄弟元素中的**倒数第n个**.
- `:only-child` 选择没有兄弟的元素 (独生子女) .
- `:only-of-type` 选择没有**同类型**兄弟的元素.
- `:root` 根元素.
- `:empty` 内容为空元素 (空格也算内容) .
- `:not(选择器)` 排除满足括号中条件的元素.
- `:checked` 被选中的复选框或单选按钮.
- `:enable` 可用的表单元素 (没有 `disabled` 属性) .
- `:disabled` 不可用的表单元素 (有 `disabled` 属性) 
- `:target` 选中锚点指向的元素.
- `:lang()` 根据指定的语言选择元素 (本质是看 lang 属性的值) .

### 2.8. 伪元素

伪元素用于向某些选择器设置特殊效果

```css
selector:pseudo-element {property:value;}
```

#### 2.8.1. `"first-line"`伪元素

`"first-line"` 伪元素用于向文本的首行设置特殊样式.

```css
p:first-line  {
  color:#ff0000;
  font-variant:small-caps;
  }
```

**注释：**"first-line" 伪元素只能用于块级元素.

**注释：**下面的属性可应用于 "first-line" 伪元素：

- font
- color
- background
- word-spacing
- letter-spacing
- text-decoration
- vertical-align
- text-transform
- line-height
- clear

#### 2.8.2. `:first-letter`伪元素

`first-letter` 伪元素用于向文本的首字母设置特殊样式：

```css
p:first-letter
  {
  color:#ff0000;
  font-size:xx-large;
  }
```

**注释：**"first-letter" 伪元素只能用于块级元素.

**注释：**下面的属性可应用于 "first-letter" 伪元素：

- font
- color
- background
- margin
- padding
- border
- text-decoration
- vertical-align (仅当 float 为 none 时)
- text-transform
- line-height
- float
- clear

#### 2.8.3. `:before`伪元素

`:before`伪元素可以在元素的内容前面插入新内容

```css
h1:before{
  content:url(logo.gif);
  }
```

#### 2.8.4. `after`伪元素

`:after` 伪元素可以在元素的内容之后插入新内容.

```css
h1:after{
  content:url(logo.gif);
  }
```

| 属性                                                         | 描述                             | CSS  |
| :----------------------------------------------------------- | :------------------------------- | :--- |
| [:first-letter](https://www.w3school.com.cn/cssref/pr_pseudo_first-letter.asp) | 向文本的第一个字母添加特殊样式. | 1    |
| [:first-line](https://www.w3school.com.cn/cssref/pr_pseudo_first-line.asp) | 向文本的首行添加特殊样式.       | 1    |
| [:before](https://www.w3school.com.cn/cssref/pr_pseudo_before.asp) | 在元素之前添加内容.             | 2    |
| [:after](https://www.w3school.com.cn/cssref/pr_pseudo_after.asp) | 在元素之后添加内容.             | 2    |

## 3. 选择器权重

> 行内样式 > ID选择器 > 类选择器 > 元素选择器 > 通配选择器.