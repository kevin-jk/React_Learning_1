import React, {Component, PropTypes} from 'react';
import Card from './Card';
import {DropTarget} from 'react-dnd';
import constant from  './constant';

/**
 * 显示的在组件中声明可以使用哪些属性，哪些属性是必须的以及数据类型
 *
 *
 * todo {...card} 什么意思？
 * */

const listTargetSpec = {
    hover(props, monitor) {
        const draggedId = monitor.getItem().id;
        props.cardCallbacks.updateStatus(draggedId, props.id)
    }
}

function collect(collect, monitor) {
    return {
        connectDropTarget: collect.dropTarget()
    }
}

class List extends Component {
    render() {
        const {connectDropTarget} = this.props;
        let cards = this.props.cards.map((card) => {
            return <Card key={card.id}
                         taskCallbacks={this.props.taskCallbacks}
                         cardCallbacks={this.props.cardCallbacks}
                         {...card} />
        });

        return connectDropTarget(
            <div className="list">
                <h1>{this.props.title}</h1>
                {cards}
            </div>
        );
    }
};
List.propTypes = {
    title: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.object),
    taskCallbacks: PropTypes.object,
    cardCallbacks: PropTypes.object,
    connectDropTarget:PropTypes.func.isRequired
};

export default DropTarget(constant.CARD,listTargetSpec,collect)(List);
