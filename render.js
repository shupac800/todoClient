"use strict";

const apiUrl = "http://localhost:5000/api";
//const apiUrl = "http://dss-todo-server.herokuapp.com/api";

const ToDo = React.createClass({
  getInitialState: function() {
    this.state = {};
    let isDone_bool = this.props.isDone.toString() === "true" ? true : false;
    return {isDone: isDone_bool};
  },
  render: function() {
    return (
      <span className="todo">
        <input type="checkbox" defaultChecked={this.state.isDone} onClick={this.handleClick}/>
        <span className="taskText">{this.props.text}</span>
      </span>
    );
  },
  handleClick: function(event) {
    // toggle checkbox
    this.state.isDone = !this.state.isDone;
    $.ajax({
      url: apiUrl + "?key=" + this.props.fbKey + "&isDone=" + this.state.isDone,
      type: "PUT",
      success: () => {
        console.log("changed isDone to",this.state.isDone);
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      }
    });
  }
});

const ToDoList = React.createClass({
  getInitialState: function() {
    return {list: []}
  },
  componentDidMount: function() {
    $("#addTask").on("click", this.addTask);
    $("#newTaskName").on("keydown", (e) => {if (e.which === 13) this.addTask()});
    this.loadToDoListFromServer();
  },
  loadToDoListFromServer: function() {
    $.ajax({
      url: apiUrl,
      type: "GET",
      success: (res) => {
        let foo = [];
        if (res.data !== null) {  // res.data will be null if database is empty
          Object.keys(res.data).forEach((key) => {
            foo.push({id: key, data: res.data[key]})
          });
        }
        this.setState({list: foo.reverse()});  // newest entries are first in list
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
      let displayList = this.state.list.map((o) => {
        return <li key={o.id}>
                 <ToDo fbKey={o.id} text={o.data.text} isDone={o.data.isDone}></ToDo>
                 <span className="tiny" id={o.id} onClick={this.deleteTask}>del</span>
               </li>
      });
      console.log(displayList);
      return (
        <div className="todoList">
          <ul>{displayList}</ul>
        </div>
      );
    } else { return null }
  },
  deleteTask: function(e) {
    let keyToDelete = e.target.getAttribute("id");
    console.log("record to eliminate:",this.state.list.filter(n => n.id === keyToDelete));
    console.log("attempting delete on:",e.target);
    $.ajax({
      url: apiUrl + "?key=" + keyToDelete,
      type: "DELETE",
      success: () => {
        console.log("deleted");
        // how do you 
        // remove deleted key from state.list array; setState will trigger re-render
        this.setState({list: this.state.list.filter(el => el.id !== keyToDelete)})
        //console.log("this.state.list is now",this.state.list);
        //console.log("record eliminated?:",this.state.list.filter(n => n.id === keyToDelete));

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
      success: (res) => {
        let newArray = this.state.list;
        newArray.unshift({
          "id"  : res.data.key,
          "data": { "isDone": res.data.isDone,
                    "text": res.data.text }
        });
        this.setState({list: newArray});  // setState triggers new render
        $("#newTaskName").val("").focus();  // clear input box and focus on it
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      }
    })
  }
});

ReactDOM.render(React.createElement(ToDoList,null), document.getElementById("content"));