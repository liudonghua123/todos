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
]

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
  )
}

// todo-list 的容器
const todoListElement = document.getElementById('todoContainer')
// todo-input 的元素
const todoContentsInput = document.getElementById('todoContents')

// 根据id从todoItems中找到指定的todoItem
const findById = (items, id) => {
  return items.filter(item => item.id == id)[0]
}

// 更新UI
const updateUI = todoItems => {
  todoListElement.innerHTML = itemsToHtml(todoItems)
}

// 重置输入框
const resetInput = () => {
  todoContentsInput.value = ''
}

// 找到下一个todoitems中下一个id
const findNextId = () => {
  const existIds = todoItems.map(item => item.id)
  existIds.sort()
  return existIds[existIds.length - 1] + 1
}

// 在todo-list 的容器上绑定点击事件，处理子元素(input/label)的点击事件
todoListElement.addEventListener('click', e => {
  const target = e.target
  if (target.tagName.toLocaleLowerCase() === 'input') {
    const id = target.parentElement.parentElement.getAttribute('data-id')
    console.info(`target: ${target}, id: ${id}`)
    const todoItem = findById(todoItems, id)
    todoItem.completed = target.checked
    updateUI(todoItems)
  } else if (target.tagName.toLocaleLowerCase() === 'label') {
    const id = target.parentElement.parentElement.getAttribute('data-id')
    console.info(`target: ${target}, id: ${id}`)
    const todoItem = findById(todoItems, id)
    todoItem.completed = !todoItem.completed
    updateUI(todoItems)
  }
})

document
  .querySelector('ul.filters a[href="#/"]')
  .addEventListener('click', e => {
    updateUI(todoItems)
  })

document
  .querySelector('ul.filters a[href="#/active"]')
  .addEventListener('click', e => {
    const tempTodoItems = todoItems.filter(todoItem => !todoItem.completed)
    updateUI(tempTodoItems)
  })

document
  .querySelector('ul.filters a[href="#/completed"]')
  .addEventListener('click', e => {
    const tempTodoItems = todoItems.filter(todoItem => todoItem.completed)
    updateUI(tempTodoItems)
  })

document
  .querySelector('footer.footer button.clear-completed')
  .addEventListener('click', e => {
    todoItems = todoItems.filter(todoItem => !todoItem.completed)
    updateUI(todoItems)
  })

// 在todo-input 的容器上绑定键盘输入事件，处理回车事件
todoContentsInput.addEventListener('keypress', e => {
  // pressed the enter
  if (e.keyCode == 13) {
    const contents = todoContentsInput.value
    if (contents.trim()) {
      todoItems.push({
        id: findNextId(),
        title: contents,
        completed: false
      })
      updateUI(todoItems)
    }
    resetInput()
  }
})

const onReady = event => {
  // 渲染数据
  updateUI(todoItems)
}

document.addEventListener('DOMContentLoaded', onReady)
