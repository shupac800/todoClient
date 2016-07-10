"use strict";

const apiUrl = "http://dss-todo-server.herokuapp.com/api";

const ToDo = React.createClass({
  getInitialState: function() {
    this.state = {};
    let isDone_bool = this.props.isDone.toString() === "true" ? true : false;
    return {isDone: isDone_bool};
  },
  render: function() {
    return (
      <label className="todo">
        <input type="checkbox" defaultChecked={this.state.isDone} onClick={this.handleClick}/>
        {this.props.text}
        <br/>
      </label>
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
    // conditional render: don't return HTML before AJAX is finished
    if (this.state.list.length > 0) {
      return (
        <div className="todoList">
          {this.generateDisplayList(this.state.list)}
        </div>
      );
    } else { return null }
  },
  generateDisplayList: function(arr) {
    return arr.map((o) => {
      return <ToDo key={o.id} fbKey={o.id} text={o.data.text} isDone={o.data.isDone}></ToDo>
    });
  },
  addTask: function(e) {
    $.ajax({
      url: apiUrl,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({"text": $("#newTaskName").val(), "isDone": false}),
      success: (res) => {
        let newArray = this.state.list;
        newArray.unshift({
          "id": res.data.key,
          "data": { "isDone": res.data.isDone,
                    "text": res.data.text }
        });
        this.setState({list: newArray});  // setState triggers new render
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(textStatus, errorThrown);
      }
    })
  }
});

ReactDOM.render(React.createElement(ToDoList,null), document.getElementById("content"));