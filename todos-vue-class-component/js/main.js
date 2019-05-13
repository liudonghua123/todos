// import Vue from '../vender/vue.esm.browser';
// import Component from '../vender/vue-class-component.esm';
const Component = VueClassComponent.default;

@Component({
  template: `
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          id="todoContents"
          class="new-todo"
          placeholder="What needs to be done?"
          @keyup.enter = "onCreateItem"
          v-model = "todoText"
          autoFocus
        />
      </header>
      <section class="main">
        <input id="toggle-all" class="toggle-all" type="checkbox" />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul id="todoContainer" class="todo-list">
          <li v-for = "item in todoItems" :class ="item.isCompleted ? 'completed' : ''">
            <div class = "view" >
              <input class = "toggle" type = "checkbox" :checked = "item.isCompleted" @change = "toggleCompleted(item._id)"/>
              <label @click = "toggleCompleted(item._id)" > {{item.text}} </label>
              <button class = "destroy" />
            </div>
          </li>
        </ul>
        <footer class="footer">
          <span class="todo-count" />
          <ul class="filters">
            <li>
              <a href="#/" class="selected" @click="filterAll">
                All
              </a>
            </li>
            <li>
              <a href="#/active" @click="filterActive">
                Active
              </a>
            </li>
            <li>
              <a href="#/completed" @click="filterCompleted">
                Completed
              </a>
            </li>
          </ul>
          <button class="clear-completed" @click="clearCompleted">
            Clear completed
          </button>
        </footer>
      </section>
    </section>
  `
})
class App extends Vue {
  data() {
    return {
      todoItems: [],
      todoText: '',
      originTodoItems: [],
      // API 请求的网址前缀
      api_host: 'http://113.55.12.52:50140',
      // 提取一些通用的ajax请求参数
      commonFetchOptions: {
        method: 'GET',
        mode: 'cors', // no-cors, cors, *same-origin
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
    };
  }

  /**
   * 组件创建
   */
  async created() {
    await this.login();
    await this.loadTodoItems();
  }

  /**
   * 组件加载，类似于 react 的 componentDidMount
   */
  mounted() {
    // console.info(`mounted`);
  }

  /**
   * 登录获取其他api接口的认证 token
   */
  async login() {
    const loginData = {
      email: 'test@test.com',
      password: 'test'
    };
    try {
      // 获取 token
      let response = await fetch(`${this.api_host}/api/users/login`, {
        ...this.commonFetchOptions,
        method: 'POST',
        body: JSON.stringify(loginData)
      });
      const { token } = await response.json();
      // 设置通用的ajax请求参数中请求头里面的Authorization
      this.commonFetchOptions.headers['Authorization'] = token;
    } catch (e) {
      console.log(`Woops!, some error ${e.message} occurs`);
    }
  }

  /**
   * 获取 todoItems 数据
   */
  async loadTodoItems() {
    try {
      let response = await fetch(
        `${this.api_host}/api/todos/`,
        this.commonFetchOptions
      );
      response = await response.json();
      const todoItems = response.data;
      console.info(`initial todoItems: ${JSON.stringify(todoItems)}`);
      this.todoItems = todoItems;
      this.originTodoItems = todoItems;
    } catch (e) {
      console.log(`Woops!, some error ${e.message} occurs`);
    }
  }

  /**
   * 添加 todoItem
   */
  async addTodoItem(todoItem) {
    try {
      let response = await fetch(`${this.api_host}/api/todos/`, {
        ...this.commonFetchOptions,
        method: 'POST',
        body: JSON.stringify(todoItem)
      });
      response = await response.json();
      console.info(`added todoItem: ${JSON.stringify(response.data)}`);
      await this.loadTodoItems();
    } catch (e) {
      console.log(`Woops!, some error ${e.message} occurs`);
    }
  }

  /**
   * 更新 todoItem
   */
  async updateTodoItem(todoItem) {
    try {
      let response = await fetch(`${this.api_host}/api/todos/${todoItem._id}`, {
        ...this.commonFetchOptions,
        method: 'PUT',
        body: JSON.stringify(todoItem)
      });
      response = await response.json();
      console.info(`updated todoItem: ${JSON.stringify(response.data)}`);
      await this.loadTodoItems();
    } catch (e) {
      console.log(`Woops!, some error ${e.message} occurs`);
    }
  }

  /**
   * 删除已完成的 todoItem 数据
   */
  async deleteCompletedTodoItems() {
    try {
      const deleteIds = this.todoItems
        .filter(todoItem => todoItem.isCompleted)
        .map(todoItem => todoItem._id);
      let response = await fetch(`${this.api_host}/api/todos/`, {
        ...this.commonFetchOptions,
        method: 'DELETE',
        body: JSON.stringify({
          _ids: deleteIds
        })
      });
      response = await response.json();
      console.info(`deleted todoItem: ${JSON.stringify(response.data)}`);
      await this.loadTodoItems();
    } catch (e) {
      console.log(`Woops!, some error ${e.message} occurs`);
    }
  }

  /**
   * 输入框点击Enter键，创建一个todo
   */
  onCreateItem(e) {
    if (this.todoText.trim()) {
      const todoItem = {
        text: this.todoText,
        isCompleted: false
      };
      this.todoText = '';
      this.addTodoItem(todoItem);
    }
  }

  /**
   * 改变 todo 的 isCompleted 状态的回调
   */
  async toggleCompleted(id) {
    let todoItem = this.todoItems.find(item => item._id == id);
    todoItem.isCompleted = !todoItem.isCompleted;
    this.updateTodoItem(todoItem);
  }

  /**
   * 过滤所有的 todoItems
   */
  filterAll() {
    this.todoItems = this.originTodoItems;
  }

  /**
   * 过滤活动的 todoItems
   */
  filterActive() {
    this.todoItems = this.originTodoItems.filter(
      item => item.isCompleted == false
    );
  }

  /**
   * 过滤已经完成的 todoItems
   */
  filterCompleted() {
    this.todoItems = this.originTodoItems.filter(
      item => item.isCompleted == true
    );
  }

  /**
   * 删除已经完成的 todoItems
   */
  clearCompleted() {
    this.deleteCompletedTodoItems();
  }
}

const app = new Vue({
  el: '#app',
  components: {
    App
  }
});
