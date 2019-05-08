// 一些初始化的数据
let todoItems = [
  {
    id: 1,
    title: 'completed todo',
    completed: true
  },
  {
    id: 2,
    title: 'uncompleted todo',
    completed: false
  }
];

// 根据数据生成相应的html
const itemsToHtml = items => {
  return items.reduce(
    (a, item) =>
      a +
      `
<li data-id="${item.id}"${item.completed ? ' class="completed"' : ''}>
	<div class="view">
		<input class="toggle" type="checkbox" ${item.completed ? 'checked' : ''}>
		<label>${item.title}</label>
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
  return items.filter(item => item.id == id)[0];
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
  const existIds = todoItems.map(item => item.id);
  existIds.sort();
  return existIds[existIds.length - 1] + 1;
};

todoListElement.click(e => {
  const target = $(e.target);
  if (target.is('input')) {
    const id = target
      .parent()
      .parent()
      .attr('data-id');
    const todoItem = findById(todoItems, id);
    todoItem.completed = target.prop('checked');
    updateUI(todoItems);
  } else if (target.is('label')) {
    const id = target
      .parent()
      .parent()
      .attr('data-id');
    const todoItem = findById(todoItems, id);
    todoItem.completed = !todoItem.completed;
    updateUI(todoItems);
  }
});

// 在todo-input 的容器上绑定键盘输入事件，处理回车事件
todoContentsInput.keypress(e => {
  // pressed the enter
  if (e.keyCode == 13) {
    const contents = todoContentsInput.val();
    if (contents.trim()) {
      todoItems.push({
        id: findNextId(),
        title: contents,
        completed: false
      });
      updateUI(todoItems);
    }
    resetInput();
  }
});

$('ul.filters a[href="#/"]').click(e => {
  updateUI(todoItems);
});

$('ul.filters a[href="#/active"]').click(e => {
  const tempTodoItems = todoItems.filter(todoItem => !todoItem.completed);
  updateUI(tempTodoItems);
});

$('ul.filters a[href="#/completed"]').click(e => {
  const tempTodoItems = todoItems.filter(todoItem => todoItem.completed);
  updateUI(tempTodoItems);
});

$('footer.footer button.clear-completed').click(e => {
  todoItems = todoItems.filter(todoItem => !todoItem.completed);
  updateUI(todoItems);
});

$(() => {
  updateUI(todoItems);
});
