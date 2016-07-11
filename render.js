"use strict";

const apiUrl = "http://localhost:5000/api";
//const apiUrl = "http://dss-todo-server.herokuapp.com/api";

const Task = React.createClass({
  getInitialState: function() {
    this.state = {};
    return {isDone: this.props.isDone};
  },
  render: function() {
    return (
      <span className="task">
        <input type="checkbox" defaultChecked={this.state.isDone} onClick={this.handleClick}/>
        <span className="taskText">{this.props.text}</span>
      </span>
    );
  },
  handleClick: function(event) {
    // toggle checkbox
    // note that setState is asynchronous, so we need a callback
    this.setState({isDone: !this.state.isDone}, () => {
      $.ajax({
        url: apiUrl + "?key=" + this.props.fbKey + "&isDone=" + this.state.isDone,
        type: "PUT",
        success: () => {
          $("#newTaskName").focus();  // focus on input box
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.log(textStatus, errorThrown);
        }
      });
    });
  }
});

const TaskList = React.createClass({
  getInitialState: function() {
    return {list: []}
  },
  componentDidMount: function() {
    $("#addTask").on("click", this.addTask);
    $("#newTaskName").on("keydown", e => {if (e.which === 13) this.addTask()});
    this.loadTaskListFromServer();
  },
  loadTaskListFromServer: function() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: res => {
        let taskArray = [];
        if (res !== null) {  // res will be null if database is empty
          Object.keys(res).forEach(key => {
            taskArray.push({id: key, isDone: res[key].isDone, text: res[key].text})
          });
        }
        this.setState({list: taskArray.reverse()});  // newest entries are first in list
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      }
    });
  },
  render: function() {
    // conditional: don't return HTML before AJAX is finished
    if (this.state.list.length > 0) {
      // create a list of React elements
      const displayList = this.state.list.map(o => {
        return <li key={o.id}>
                 <Task fbKey={o.id} text={o.text} isDone={o.isDone}></Task>
                 <span className="tiny" id={o.id} onClick={this.deleteTask}>del</span>
               </li>
      });
      return (
        <div className="taskList">
          <ul>{displayList}</ul>
        </div>
      );
    } else { return null }
  },
  deleteTask: function(e) {
    const keyToDelete = e.target.getAttribute("id");
    $.ajax({
      url: apiUrl + "?key=" + keyToDelete,
      type: "DELETE",
      success: () => {
        // remove deleted key from state.list array; setState will trigger re-render
        this.setState({list: this.state.list.filter(el => el.id !== keyToDelete)});
        $("#newTaskName").focus();  // focus on input box
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      }
    });
  },
  addTask: function(event) {
    $.ajax({
      url: apiUrl,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({"text": $("#newTaskName").val(), "isDone": false}),
      success: res => {
        let newArray = this.state.list;
        newArray.unshift({"id": res.key, "isDone": res.isDone, "text": res.text});
        this.setState({list: newArray});  // setState triggers new render
        $("#newTaskName").val("").focus();  // clear input box and focus on it
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      }
    });
  }
});

ReactDOM.render(React.createElement(TaskList,null), document.getElementById("content"));