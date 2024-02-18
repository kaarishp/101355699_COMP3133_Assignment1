var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var mongoose = require('mongoose');
var { User, Employee } = require('./model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();

// MongoDB connection
const DB_CONNECTION_STRING = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Success Mongodb connection');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// GraphQL schema
var schema = buildSchema(`
  type User {
    _id: ID!
    username: String!
    email: String!
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    salary: Float!
  }

  type Query {
    users: [User]
    employees: [Employee]
    employee(id: ID!): Employee
    login(usernameOrEmail: String!, password: String!): User
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): User
    addEmployee(first_name: String!, last_name: String!, email: String!, gender: String, salary: Float!): Employee
    updateEmployee(id: ID!, input: UpdateEmployeeInput!): Employee
    deleteEmployee(id: ID!): Employee
  }
  
  input UpdateEmployeeInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    salary: Float
  }
  
`);

// GraphQL resolvers
var root = {
  users: async () => {
    const users = await User.find();
    if (!users || users.length === 0) {
      throw new Error('No users found');
    }
    return users;
  },
  employees: async () => {
    const employees = await Employee.find();
    if (!employees || employees.length === 0) {
      throw new Error('No employees found');
    }
    return employees;
  },
  employee: async ({ id }) => {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  },
  signup: async ({ username, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, email, password: hashedPassword});
    await user.save();
    return user;
  },
  login: async ({ usernameOrEmail, password }) => {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) {
      throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid password');
    }
    return user;
  },    
  addEmployee: async ({ first_name, last_name, email, gender, salary }) => {
    try {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }
      const employee = new Employee({ first_name, last_name, email, gender, salary });
      await employee.save();
      return employee;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateEmployee: async ({ id, input }) => {
    const employee = await Employee.findByIdAndUpdate(id, input, { new: true });
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  },  
  deleteEmployee: async ({ id }) => {
    try {
      const employee = await Employee.findByIdAndDelete(id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      return employee;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};


var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => console.log('Server running at http://localhost:4000/graphql'));
