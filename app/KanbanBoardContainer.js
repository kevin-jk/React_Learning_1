import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';
import 'whatwg-fetch';
import 'babel-polyfill';
import {throttle} from "./utils";

/**
 *
 * state:
 *
 *1. 不要直接修改state
 * e.g. this.state.comment="value"
 *这样，代码不会重新渲染
 * 而是要：
 * this.setState(comment:"value")
 *
 * 2. React 为了性能，可能将多次更新合并成一个。因此setState可能是异步的。不能依赖他们的值计算下一个状态
 * 如：
 * this.setState({
  counter: this.state.counter + this.props.increment,
});

 可以通过setState来接受一个函数。 形如：
 this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}));

 3.
 *  * ///////////====卡片的拖动======/////////
 *
 * 1. 安装React DND2 and 它的HTML5后端
 * npm install --save react-dnd@2.x.x react-dnd-html5-backend@1.x.x
 *
 * 拖动会改变状态
 * 1. 改变卡片的状态
 * 2. 改变卡片的顺序
 *
 * 因此需要这2个方法
 * */

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
    'Content-Type': 'application/json',
    /*
     * Change the Authorization to any string you like. It can be your pet's name,
     * your middle name, your favorite animal, your superpower of choice...
     * An unique authorization will allow you to have your own environment for cards and tasks
     */
    Authorization: 'CHANGE THIS VALUE'
};

class KanbanBoardContainer extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            cards: [],
        };
        this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
        this.updateCardPosition = throttle(this.updateCardPosition.bind(this),500);
    }

    componentDidMount() {
        fetch(API_URL + '/cards', {headers: API_HEADERS})
            .then((response) => response.json())
            .then((responseData) => {
                this.setState({cards: responseData});
            })
            .catch((error) => {
                console.log('Error fetching and parsing data', error);
            });
    }


    addTask(cardId, taskName) {
        // Keep a reference to the original state prior to the mutations
        // in case we need to revert the optimistic changes in the UI
        let prevState = this.state;
        // Find the index of the card
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        // Create a new task with the given name and a temporary ID
        let newTask = {id: Date.now(), name: taskName, done: false};
        // Create a new object and push the new task to the array of tasks
        let nextState = update(this.state.cards, {
            [cardIndex]: {
                tasks: {$push: [newTask]}
            }
        });
        // set the component state to the mutated object
        this.setState({cards: nextState});
        // Call the API to add the task on the server
        fetch(`${API_URL}/cards/${cardId}/tasks`, {
            method: 'post',
            headers: API_HEADERS,
            body: JSON.stringify(newTask)
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    // Throw an error if server response wasn't 'ok'
                    // so we can revert back the optimistic changes
                    // made to the UI.
                    throw new Error("Server response wasn't OK")
                }
            })
            .then((responseData) => {
                // When the server returns the definitive ID
                // used for the new Task on the server, update it on React
                newTask.id = responseData.id
                this.setState({cards: nextState});
            })
            .catch((error) => {
                this.setState(prevState);
            });
    }

    //React的update的指令，其可以对一个对象进行深度复制和修改
    deleteTask(cardId, taskId, taskIndex) {
        // Keep a reference to the original state prior to the mutations
        // in case we need to revert the optimistic changes in the UI
        let prevState = this.state;
        // Find the index of the card
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        // Create a new object without the task
        let nextState = update(this.state.cards, {
            [cardIndex]: {
                tasks: {$splice: [[taskIndex, 1]]}
            }
        });
        // set the component state to the mutated object
        this.setState({cards: nextState});
        // Call the API to remove the task on the server
        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method: 'delete',
            headers: API_HEADERS
        })
            .then((response) => {
                if (!response.ok) {
                    // Throw an error if server response wasn't 'ok'
                    // so we can revert back the optimistic changes
                    // made to the UI.
                    throw new Error("Server response wasn't OK")
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error)
                this.setState(prevState);
            });
    }

    toggleTask(cardId, taskId, taskIndex) {
        // Keep a reference to the original state prior to the mutations
        // in case we need to revert the optimistic changes in the UI
        let prevState = this.state;
        // Find the index of the card
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        // Save a reference to the task's 'done' value
        let newDoneValue;
        // Using the $apply command, we will change the done value to its opposite
        let nextState = update(
            this.state.cards, {
                [cardIndex]: {
                    tasks: {
                        [taskIndex]: {
                            done: {
                                $apply: (done) => {
                                    newDoneValue = !done
                                    return newDoneValue;
                                }
                            }
                        }
                    }
                }
            });
        // set the component state to the mutated object
        this.setState({cards: nextState});
        // Call the API to toggle the task on the server
        fetch(`${API_URL}/cards/${cardId}/tasks/${taskId}`, {
            method: 'put',
            headers: API_HEADERS,
            body: JSON.stringify({done: newDoneValue})
        })
            .then((response) => {
                if (!response.ok) {
                    // Throw an error if server response wasn't 'ok'
                    // so we can revert back the optimistic changes
                    // made to the UI.
                    throw new Error("Server response wasn't OK")
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error)
                this.setState(prevState);
            });
    }


    updateCardStatus(cardId, listId) {
        let cardIndex = this.state.cards.findIndex((card) => card.id == cardId);
        let card = this.state.cards[cardIndex];
        if (card.status != listId) {
            this.setState(update(this.state, {
                cards: {
                    [cardIndex]: {
                        status: {$set: listId}
                    }
                }
            }))
        }
    }

    updateCardPosition(cardId, afterId) {
        if (cardId != afterId) {
            let cardIndex = this.state.cards.findIndex(card => card.id == cardId);
            let card = this.state.cards[cardIndex];
            let afterIndex = this.state.cards.findIndex(card => card.id == afterId);
            // splice(start index, int num, String[]args)  从index开始删除num个元素，然后将args加载后面

            // 下面的意思是： 将cards列表的第cardIndex元素删除，然后将其加在afterIndex后。

            //this.setState 是异步方法
            this.setState(update(this.state, {
                cards: {
                    $splice: [
                        [cardIndex, 1],
                        [afterIndex, 0, card]
                    ]
                }
            }));
        }
    }

    render() {
        return (
            <KanbanBoard cards={this.state.cards}
                         taskCallbacks={{
                             toggle: this.toggleTask.bind(this),
                             delete: this.deleteTask.bind(this),
                             add: this.addTask.bind(this)
                         }}
                         cardCallbacks={
                             {
                                 updateStatus: this.updateCardStatus,
                                 updatePosition: this.updateCardPosition
                             }
                         }

            />
        )
    }
}

export default KanbanBoardContainer;
