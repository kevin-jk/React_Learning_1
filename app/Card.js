import React, {Component, PropTypes} from 'react';
import CheckList from './CheckList';
import marked from 'marked';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {DragSource,DropTarget} from 'react-dnd';
import constant from './constant';

/**
 *
 * * /////////////===支持动画和拖放===////////////////
 *
 * 1. 安装ReactCSSTransitionGroup插件  npm install --save react-addons-css-transition-group
 * 2. 导入包
 * 3. 封装cardDetails
 * 4. 创建一个css过渡动画来改变max-height属性
 *
 *
 * /////////////////=========夸列表拖拽===========//////
 *
 * 将不同任务状态的任务进行切换。
 *
 *拖拽源为card, target为list, 上下文为KanbanBoard
 *
 * step by one step:
 * 1. 将Card组件设置为DragSource
 */
let titlePropType = (props, propName, componentName) => {
    if (props[propName]) {
        let value = props[propName];
        if (typeof value !== 'string' || value.length > 80) {
            return new Error(
                `${propName} in ${componentName} is longer than 80 characters`
            );
        }
    }
};

/**
 * DragSource 和 DropTarget  需要文件范例进行一些设置。需要提供3个参数： type, spec, 和collect函数
 *
 * type: 指定组件名称
 * spec:定义如何响应拖拽和放置事件，是一个包含了若干函数的js对象。对应DragSource而言有beginDrag, endDrag ，
 * 对于DropTarget来说有canDrag 和onDrop
 * collect函数：
 *类似于一个props的子集，通过collect函数来控制哪些属性需要进行注入和注入的方式。
 *
 * 当发生拖拽的时候，ReactDnd会调用你组件中定义的collect函数，并传入2个参数，connector和monitor
 * connector: 在组件渲染是用于界定组件DOM的范围
 * monitor: 将拖放状态映射为属性。
 * */

//定义spec
const cardDragSpec = {
    beginDrag(props) {
        return {
            id: props.id,
            status:props.status
        };
    },
    endDrag(props) {
        props.cardCallbacks.persistCardDrag(props.id, props.status);
    }
}

// 定义以DragTarget身份的spec
const cardDropSpec={
    hover(props,monitor){
        const draggedId=monitor.getItem().id;
        props.cardCallbacks.updatePosition(draggedId,props.id);
    }
}
//将connector和状态映射为组件的props属性，这里传入了一个属性
let collectDrag = (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        //isOver:monitor.isOver(),
    };
}

let collectDrop=(connect,monitor)=>{
    return {
        connectDropTarget:connect.dropTarget()
    }
}
class Card extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            showDetails: false
        };
    }

    toggleDetails() {
        this.setState({showDetails: !this.state.showDetails});
    }

    render() {
        //解析赋值， 后面使用的时候可以直接用connectDragSource， 而不用写成this.props.connectDragSource
        const {connectDragSource,connectDropTarget} = this.props;
        let cardDetails;
        if (this.state.showDetails) {
            cardDetails = (
                <div className="card__details">
                    <span dangerouslySetInnerHTML={{__html: marked(this.props.description)}}/>
                    <CheckList cardId={this.props.id}
                               tasks={this.props.tasks}
                               taskCallbacks={this.props.taskCallbacks}/>
                </div>
            );
        }

        let sideColor = {
            position: 'absolute',
            zIndex: -1,
            top: 0,
            bottom: 0,
            left: 0,
            width: 7,
            backgroundColor: this.props.color
        };
        // 开发人员需要显示的绑定
        // .bind(this)
        // 有多个className的时候，如果相同的样式，后一个会覆盖前一个，总的样式为叠加
        // 使用props对原有的div进行封装
        return connectDropTarget(connectDragSource(

            <div className="card">
                <div style={sideColor}/>
                <div className={
                    this.state.showDetails ? "card__title card__title--is-open" : "card__title"
                } onClick={this.toggleDetails.bind(this)}>
                    {this.props.title}
                </div>
                <ReactCSSTransitionGroup transitionName="toggle" transitionEnterTimeout={250}>
                    {cardDetails}
                </ReactCSSTransitionGroup>

            </div>
        ));
    }
}

Card.propTypes = {
    id: PropTypes.number,
    title: titlePropType,
    description: PropTypes.string,
    color: PropTypes.string,
    tasks: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    connectDragSource:PropTypes.func.isRequired,
    connectDropTarget:PropTypes.func.isRequired
};

const source = DragSource(constant.CARD,cardDragSpec,collectDrag)(Card);
const both = DropTarget(constant.CARD,cardDropSpec,collectDrop)(source);
export default both;
