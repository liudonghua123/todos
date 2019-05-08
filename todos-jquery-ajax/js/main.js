// 一些初始化的数据
let todoItems = [];
let token = null;
const api_host = 'http://113.55.12.52:50140';

// 根据数据生成相应的html
const itemsToHtml = items => {
  return items.reduce(
    (a, item) =>
      a +
      `
<li data-id="${item._id}"${item.isCompleted ? ' class="completed"' : ''}>
	<div class="view">
		<input class="toggle" type="checkbox" ${item.isCompleted ? 'checked' : ''}>
		<label>${item.text}</label>
		<button class="destroy"></button>
	</div>
</li>`,
    ''
  );
};

// todo-list 的容器
const todoListElement = $('#todoContainer');
// todo-input 的元素
const todoContentsInput = $('#todoContents');

// 根据id从todoItems中找到指定的todoItem
const findById = (items, id) => {
  return items.filter(item => item._id == id)[0];
};

// 根据id从todoItems中找到指定的todoItem
const replaceById = (items, item, id) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i]._id === id) {
      items[i] = item;
    }
  }
};

// 更新UI
const updateUI = todoItems => {
  todoListElement.html(itemsToHtml(todoItems));
};

// 重置输入框
const resetInput = () => {
  todoContentsInput.val('');
};

// 找到下一个todoitems中下一个id
const findNextId = () => {
  const existIds = todoItems.map(item => item._id);
  existIds.sort();
  return existIds[existIds.length - 1] + 1;
};

todoListElement.click(e => {
  const target = $(e.target);
  let todoItem = null;
  if (target.is('input')) {
    const id = target
      .parent()
      .parent()
      .attr('data-id');
    todoItem = findById(todoItems, id);
    todoItem.isCompleted = target.prop('checked');
  } else if (target.is('label')) {
    const id = target
      .parent()
      .parent()
      .attr('data-id');
    todoItem = findById(todoItems, id);
    todoItem.isCompleted = !todoItem.isCompleted;
  }
  // 通过ajax方式更新数据
  $.ajax({
    url: `${api_host}/api/todos/${todoItem._id}`,
    method: 'PUT',
    data: JSON.stringify(todoItem)
  }).done(function(res) {
    // console.info(`got updated data: ${JSON.stringify(res, null, 2)}`);
    const todoItem = res.data;
    replaceById(todoItems, todoItem, todoItem._id);
    // console.info(`updated todoItems: ${JSON.stringify(todoItems, null, 2)}`);
    updateUI(todoItems);
  });
});

// 在todo-input 的容器上绑定键盘输入事件，处理回车事件
todoContentsInput.keypress(e => {
  // pressed the enter
  if (e.keyCode == 13) {
    const contents = todoContentsInput.val();
    if (contents.trim()) {
      // 通过ajax方式获取数据
      $.ajax({
        url: `${api_host}/api/todos/`,
        method: 'POST',
        data: JSON.stringify({
          text: contents,
          isCompleted: false
        })
      }).done(function(res) {
        const todoItem = res.data;
        todoItems.push(todoItem);
        updateUI(todoItems);
      });
    }
    resetInput();
  }
});

$('ul.filters a[href="#/"]').click(e => {
  updateUI(todoItems);
});

$('ul.filters a[href="#/active"]').click(e => {
  const tempTodoItems = todoItems.filter(todoItem => !todoItem.isCompleted);
  updateUI(tempTodoItems);
});

$('ul.filters a[href="#/completed"]').click(e => {
  const tempTodoItems = todoItems.filter(todoItem => todoItem.isCompleted);
  updateUI(tempTodoItems);
});

$('footer.footer button.clear-completed').click(e => {
  const deleteIds = todoItems
    .filter(todoItem => todoItem.isCompleted)
    .map(todoItem => todoItem._id);
  // 通过ajax方式批量删除数据
  $.ajax({
    url: `${api_host}/api/todos/`,
    method: 'DELETE',
    data: JSON.stringify({ _ids: deleteIds })
  }).done(function(res) {
    console.info(`got deleted data: ${JSON.stringify(res, null, 2)}`);
    // 重新获取新数据
    $.ajax({
      url: `${api_host}/api/todos/`,
      method: 'GET'
    }).done(function(res) {
      console.info(`update date with ${JSON.stringify(res)}`);
      todoItems = res.data;
      updateUI(todoItems);
    });
  });
  updateUI(todoItems);
});

$(() => {
  // 登陆获取token
  $.ajax({
    url: `${api_host}/api/users/login`,
    method: 'POST',
    data: JSON.stringify({
      email: 'test@test.com',
      password: 'test'
    }),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    dataType: 'json'
  }).done(function(res) {
    token = res.token;
    console.info(`get token: ${token}`);
    // 设置全局配置
    $.ajaxSetup({
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `${token}`
      },
      // beforeSend: xhr => {
      //   xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      //   xhr.setRequestHeader('Authorization', `${token}`);
      // },
      dataType: 'json'
    });
    console.info(`$.ajaxSetup finished`);
    // 通过ajax方式获取数据
    $.ajax({
      url: `${api_host}/api/todos/`,
      method: 'GET'
    }).done(function(res) {
      console.info(`data initialization with ${JSON.stringify(res)} finished`);
      todoItems = res.data;
      updateUI(todoItems);
    });
  });
});
