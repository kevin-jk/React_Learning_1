学习react

react-in-action中的例子



# 拖拽的支持
##1. 依赖的安装
npm install --save react-dnd@2.x.x react-dnd-html5-backend@1.x.x

##2. 拖拽源，拖拽目标，拖拽上下文的确定。例如需要将A拖到B内，那么A就是拖拽源，B就是拖拽目标，A和B共同的父组件就是拖拽上下文
##3. 以上3部分内容中，代码的添加
其中拖拽源和拖拽目标具有3要素：type, spec, 和collect函数
* type: 指定组件名称
* spec:定义如何响应拖拽和放置事件，是一个包含了若干函数的js对象。对应DragSource而言有beginDrag, endDrag ，对于DropTarget来说有canDrag 和onDrop
* collect函数：类似于一个props的子集，通过collect函数来控制哪些属性需要进行注入和注入的方式。当发生拖拽的时候，ReactDnd会调用你组件中定义的collect函数，并传入2个参数，connector和monitor
  * connector: 在组件渲染是用于界定组件DOM的范围
  * monitor: 将拖放状态映射为属性。
###3.1 拖拽源的代码:参见相关代码，不具体描述，大致就是定义上述的3要素， 并导出对应高阶组件。

# 节流回调函数
当发生拖拽的时候，会触发大量的回调函数
通过节流函数，当某个函数被多次调用的时候，在一段的时间内，只执行一次。

