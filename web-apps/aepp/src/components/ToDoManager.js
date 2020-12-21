import React, { Component } from 'react'
import { Aepp } from '@aeternity/aepp-sdk'
import { connect } from 'react-redux'
import ToDos from './ToDos'

import uuid from 'uuid/v4'
import KEYS from './../configs/keys'
import visibility from './../configs/visibility'

export class ToDoManager extends Component {

    async getReverseWindow() {
        const iframe = document.createElement('iframe')
        iframe.src = prompt('Enter wallet URL', 'http://localhost:8081')
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
        await new Promise(resolve => {
            const handler = ({ data }) => {
                if (data.method !== 'ready') return
                window.removeEventListener('message', handler)
                resolve()
            }
            window.addEventListener('message', handler)
        })
        return iframe.contentWindow
    }

    async getClient() {
        try {
            const { contractDetails } = this.props;

            // Aepp approach
            this.client = await Aepp({
                parent: this.runningInFrame ? window.parent : await this.getReverseWindow()
            });
            
            this.contractInstance = await this.client.getContractInstance(contractDetails.contractSource, { contractAddress: contractDetails.contractAddress });

            return this.contractInstance;

        } catch (err) {
            console.log(err);
        }
    }

    async getToDos(instance) {
        const allToDosResponse = await instance.call("get_todos", []);
        const allToDos = await allToDosResponse.decode();
        const parsedToDos = this.convertSophiaListToTodos(allToDos);

        return parsedToDos;
    }

    convertToTODO = (data) => {
        return {
            title: data.name,
            isCompleted: data.is_completed ? visibility.COMPLETED : visibility.ACTIVE,
            editable: false,
            editedTitle: ''
        }
    }

    convertSophiaListToTodos(data) {
        let tempCollection = [];
        let taskId;

        for (let dataIndex in data) {
            let todoInfo = data[dataIndex];

            taskId = todoInfo[0];
            let todo = this.convertToTODO(todoInfo[1]);
            todo.id = taskId;

            tempCollection.push(todo);
        }

        return tempCollection;
    }

    addTodo = async (e) => {
        if(e.keyCode === KEYS.ENTER){
            e.preventDefault();
            let todo = e.target.value;
            e.target.value = '';
            if(!todo || todo === '') {
                alert('Invalid to-do title!');
                return;
            }

            let result = await this.props.client.call('add_todo', [todo]);
            todo = {
                id: result.decodedResult,
                title: todo
            }

            this.props.addTodo(todo);
        }
    }

    async componentDidMount() {

        const contractInstance = await this.getClient();
        this.props.setClient(contractInstance)

        const todos = await this.getToDos(contractInstance);
        this.props.addManyTodos(todos);
    }
    
    render() {

        return (
            <div>
                <section key={ uuid() } className="todoapp">
		            <header className="add-todo">
                        
                        <input className="new-todo"
                            autoFocus
                            autoComplete="off"
                            placeholder="What needs to be done?"
                            onKeyDown={this.addTodo}
                        />
		            </header>
                    <section key={ uuid() } className="main">
                        <ToDos key={ uuid() } todos={ this.props.todos }/>
                    </section>
                    
                    
                </section>


            </div>
        )
    }
}

const mapStateToPros = (state) => {
    return state;
}

const mapDispatchToProps = (dispatch) => {
    return {
        addTodo: (todo) => {
            dispatch({ type: "ADD_TODO", todo: todo });
        },
        addManyTodos: (todos) => {
            dispatch({ type: "ADD_MANY_TODOS", todos });
        },
        setClient: (client) => {
            dispatch({
                type: "SET_CLIENT",
                client
            })
        }
    }
}

// styles
// const bodyStyle = {
//     margin: 0,
//     padding: 0
// }

// const buttonStyle = {
//     "margin": "0",
//     "padding": "0",
//     "border": "0",
//     "background": "none",
//     "fontSize": "100%",
//     "verticalAlign": "baseline",
//     "fontFamily": "inherit",
//     "fontWeight": "inherit",
//     "color": "inherit",
//     "WebkitAppearance": "none",
//     "appearance": "none",
//     "WebkitFontSmoothing": "antialiased",
//     "MozOsxFontSmoothing": "grayscale"
// }

// const bodyStyle  = {
//     "margin": "0",
//     "padding": "0",
//     "font": "14px Helvetica Neue, Helvetica, Arial, sans-serif",
//     "lineHeight": "1.4em",
//     "background": "#f5f5f5",
//     "color": "#4d4d4d",
//     "minWidth": "230px",
//     "maxWidth": "550px",
//     "margin": "0 auto",
//     "WebkitFontSmoothing": "antialiased",
//     "MozOsxFontSmoothing": "grayscale",
//     "fontWeight": "300"
// }

// :focus {
//     outline: 0;
// }

// .hidden {
//     display: none;
// }

// .disable-todos {
//     opacity: 0.2;
// }

// .todoapp {
//     background: #fff;
//     margin: 100px 200px;
//     position: relative;
//     box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2),
//     0 25px 50px 0 rgba(0, 0, 0, 0.1);
// }

// .todoapp input::-webkit-input-placeholder {
//     font-style: italic;
//     font-weight: 300;
//     color: #e6e6e6;
// }

// .todoapp input::-moz-placeholder {
//     font-style: italic;
//     font-weight: 300;
//     color: #e6e6e6;
// }

// .todoapp input::input-placeholder {
//     font-style: italic;
//     font-weight: 300;
//     color: #e6e6e6;
// }

// .todoapp h1 {
//     position: absolute;
//     top: -155px;
//     width: 100%;
//     font-size: 100px;
//     font-weight: 100;
//     text-align: center;
//     color: rgba(175, 47, 47, 0.15);
//     -webkit-text-rendering: optimizeLegibility;
//     -moz-text-rendering: optimizeLegibility;
//     text-rendering: optimizeLegibility;
// }

// .new-todo,
// .edit {
//     position: relative;
//     margin: 0;
//     width: 100%;
//     font-size: 24px;
//     font-family: inherit;
//     font-weight: inherit;
//     line-height: 1.4em;
//     border: 0;
//     color: inherit;
//     padding: 6px;
//     border: 1px solid #999;
//     box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
//     box-sizing: border-box;
//     -webkit-font-smoothing: antialiased;
//     -moz-osx-font-smoothing: grayscale;
// }

// .new-todo {
//     padding: 16px 16px 16px 60px;
//     border: none;
//     background: rgba(0, 0, 0, 0.003);
//     box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
// }

// .main {
//     position: relative;
//     z-index: 2;
//     border-top: 1px solid #e6e6e6;
// }

// .toggle-all {
//     width: 1px;
//     height: 1px;
//     border: none; /* Mobile Safari */
//     opacity: 0;
//     position: absolute;
//     right: 100%;
//     bottom: 100%;
// }

// .toggle-all + label {
//     width: 60px;
//     height: 34px;
//     font-size: 0;
//     position: absolute;
//     top: -52px;
//     left: -13px;
//     -webkit-transform: rotate(90deg);
//     transform: rotate(90deg);
// }

// .toggle-all + label:before {
//     content: '❯';
//     font-size: 22px;
//     color: #e6e6e6;
//     padding: 10px 27px 10px 27px;
// }

// .toggle-all:checked + label:before {
//     color: #737373;
// }

// .todo-list {
//     margin: 0;
//     padding: 0;
//     list-style: none;
// }

// .todo-list li {
//     position: relative;
//     font-size: 24px;
//     border-bottom: 1px solid #ededed;
// }

// .todo-list li:last-child {
//     border-bottom: none;
// }

// .todo-list li.editing {
//     border-bottom: none;
//     padding: 0;
// }

// .todo-list li.editing .edit {
//     display: block;
//     width: calc(100% - 43px);
//     padding: 12px 16px;
//     margin: 0 0 0 43px;
// }

// .todo-list li.editing .view {
//     display: none;
// }

// .todo-list li .toggle {
//     text-align: center;
//     width: 40px;
//     /* auto, since non-WebKit browsers doesn't support input styling */
//     height: auto;
//     position: absolute;
//     top: 0;
//     bottom: 0;
//     margin: auto 0;
//     border: none; /* Mobile Safari */
//     -webkit-appearance: none;
//     appearance: none;
// }

// .todo-list li .toggle {
//     opacity: 0;
// }

// .todo-list li .toggle + label {
//     /*
//         Firefox requires `#` to be escaped - https://bugzilla.mozilla.org/show_bug.cgi?id=922433
//         IE and Edge requires *everything* to be escaped to render, so we do that instead of just the `#` - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7157459/
//     */
//     background-image: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23ededed%22%20stroke-width%3D%223%22/%3E%3C/svg%3E');
//     background-repeat: no-repeat;
//     background-position: center left;
// }

// .todo-list li .toggle:checked + label {
//     background-image: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23bddad5%22%20stroke-width%3D%223%22/%3E%3Cpath%20fill%3D%22%235dc2af%22%20d%3D%22M72%2025L42%2071%2027%2056l-4%204%2020%2020%2034-52z%22/%3E%3C/svg%3E');
// }

// .todo-list li label {
//     word-break: break-all;
//     padding: 15px 15px 15px 60px;
//     display: block;
//     line-height: 1.2;
//     transition: color 0.4s;
// }

// .todo-list li.completed label {
//     color: #d9d9d9;
//     text-decoration: line-through;
// }

// .todo-list li .destroy {
//     display: none;
//     position: absolute;
//     cursor: pointer;
//     top: 0;
//     right: 10px;
//     bottom: 0;
//     width: 40px;
//     height: 40px;
//     margin: auto 0;
//     font-size: 30px;
//     color: #cc9a9a;
//     margin-bottom: 11px;
//     transition: color 0.2s ease-out;
// }

// .todo-list li .destroy:hover {
//     color: #af5b5e;
// }

// .todo-list li .destroy:after {
//     content: '×';
// }

// .todo-list li:hover .destroy {
//     display: block;
// }

// .todo-list li .edit {
//     display: none;
// }

// .todo-list li.editing:last-child {
//     margin-bottom: -1px;
// }

// .footer {
//     color: #777;
//     padding: 10px 15px;
//     height: 40px;
//     text-align: center;
//     border-top: 1px solid #e6e6e6;
// }

// .footer:before {
//     content: '';
//     position: absolute;
//     right: 0;
//     bottom: 0;
//     left: 0;
//     height: 50px;
//     overflow: hidden;
//     box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
//     0 8px 0 -3px #f6f6f6,
//     0 9px 1px -3px rgba(0, 0, 0, 0.2),
//     0 16px 0 -6px #f6f6f6,
//     0 17px 2px -6px rgba(0, 0, 0, 0.2);
// }

// .todo-count {
//     float: left;
//     text-align: left;
// }

// .todo-count strong {
//     font-weight: 300;
// }

// .filters {
//     margin: 0;
//     padding: 0;
//     list-style: none;
//     position: absolute;
//     right: 0;
//     left: 0;
// }

// .filters li {
//     display: inline;
// }

// .filters li a {
//     color: inherit;
//     margin: 3px;
//     padding: 3px 7px;
//     text-decoration: none;
//     border: 1px solid transparent;
//     border-radius: 3px;
//     cursor: pointer;
// }

// .filters li a:hover {
//     border-color: rgba(175, 47, 47, 0.1);
// }

// .filters li a.selected {
//     border-color: rgba(175, 47, 47, 0.2);
// }

// .clear-completed,
// html .clear-completed:active {
//     float: right;
//     position: relative;
//     line-height: 20px;
//     text-decoration: none;
//     cursor: pointer;
// }

// .clear-completed:hover {
//     text-decoration: underline;
// }

// .info {
//     margin: 65px auto 0;
//     color: #bfbfbf;
//     font-size: 10px;
//     text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
//     text-align: center;
// }

// .info p {
//     line-height: 1;
// }

// .info a {
//     color: inherit;
//     text-decoration: none;
//     font-weight: 400;
// }

// .info a:hover {
//     text-decoration: underline;
// }

// /*
//     Hack to remove background from Mobile Safari.
//     Can't use it globally since it destroys checkboxes in Firefox
// */
// @media screen and (-webkit-min-device-pixel-ratio: 0) {
//     .toggle-all,
//     .todo-list li .toggle {
//         background: none;
//     }

//     .todo-list li .toggle {
//         height: 40px;
//     }
// }

// @media (max-width: 430px) {
//     .footer {
//         height: 50px;
//     }

//     .filters {
//         bottom: 10px;
//     }
// }

// [v-cloak] {
//     display: none;
// }


export default connect(mapStateToPros, mapDispatchToProps)(ToDoManager)