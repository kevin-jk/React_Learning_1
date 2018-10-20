import React, { Component, PropTypes } from 'react';
import List from './List';
/**
 * 可以通过state来进行交互，对于组件来说state是室友的，可以通过this,setState来修改它的值
 *
 *  state 要尽量的简单，每次state发生变化时候，组件会重新渲染
 *
 *  对于那些可以通过交互发生变化的组件如input, textarea可以采用受控组件和非受控组件的形似进行处理
 *
 *
 *  一个包含值或者已选属性的表单组件称为受控组件，在一个受控组件中，元素内部所渲染的值将一直反应属性的值
 *  受控组件的值的更改可以通过state来处理
 *
 *  非受控组件： 不为任何输入提供值，渲染后的元素的值将反应用户的输入
 *
 * 可以通过内敛样式来定义一些动态的，与状态有关的呈现，而通过css来定义主要的杨思
 *
 * 有状态组件（内部包含state的）和无状态组件【单纯组件】（仅仅有props的）
 *
 * */



/**
 * props 是一种从父组件向子组件传输数据的放肆，父组件拥有props并传输出去
 *
 * PropTypes.arrayOf 属性必须是指定类型的数组
 * */
class KanbanBoard extends Component {
  render(){
    return (
      <div className="app">
        <List id='todo'
              title="To Do"
              cards={this.props.cards.filter((card) => card.status === "todo")}
              taskCallbacks={this.props.taskCallbacks} />
        <List id='in-progress'
              title="In Progress"
              cards={this.props.cards.filter((card) => card.status === "in-progress")}
              taskCallbacks={this.props.taskCallbacks} />
        <List id='done'
              title='Done'
              cards={this.props.cards.filter((card) => card.status === "done")}
              taskCallbacks={this.props.taskCallbacks} />
      </div>
    );
  }
};
KanbanBoard.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object),
  taskCallbacks: PropTypes.object
};

export default KanbanBoard;
