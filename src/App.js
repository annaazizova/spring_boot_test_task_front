import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactTable from "react-table";
import "react-table/react-table.css";
import matchSorter from 'match-sorter';
import { connect } from 'react-redux';
import { productsFetchData } from './actions/products';
import { productAddNew } from './actions/product';

class App extends Component {
  
  
  

  handleChange = event => {
    if (event.target.name === "name")
      this.setState({ name: event.target.value });
    if (event.target.name === "brand")
      this.setState({ brand: event.target.value });
    if (event.target.name === "price")
      this.setState({ price: event.target.value });
    if (event.target.name === "quantity")
      this.setState({ quantity: event.target.value });
  };

  renderEditable = cellInfo => {
    return (
      <div
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          let row = this.state.data[cellInfo.index];
          row[cellInfo.column.id] = e.target.innerHTML;
          this.listPrimitive.update(cellInfo.index, row);
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.data[cellInfo.index][cellInfo.column.id]
        }}
      />
    );
  };

  render() {
    const { data, isLoading, name, brand, price, quantity } = this.props;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Spring boot test task</h1>
        </div>
        <p className="App-intro">
          <form onSubmit={this.handleSubmit}>
            <h3>Add new product</h3>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={name}
                onChange={this.handleChange}
              />
            </label>{" "}
            <label>
              Brand:
              <input
                type="text"
                name="brand"
                value={brand}
                onChange={this.handleChange}
              />
            </label>{" "}
            <label>
              Price:
              <input
                type="text"
                name="price"
                value={price}
                onChange={this.handleChange}
              />
            </label>{" "}
            <label>
              Quantity:
              <input
                type="text"
                name="quantity"
                value={quantity}
                onChange={this.handleChange}
              />
            </label> 
            <input type="submit" value="Add" />
          </form>
        </p>
        <div>
        <button onClick={this.exportToXLS}>Export shown to xls</button>
        <label/>{" "}
        <button onClick={this.showLeftovers}>Show leftovers</button>
        </div>
        <div>
          <ReactTable
            data={data}
            ref={(r) => {
              this.selectTable = r;
            }}
            filterable
            defaultFilterMethod={(filter, row) =>
            String(row[filter.id]) === filter.value}
            columns={[
              {
                Header: "ID",
                accessor: "id",
                Cell: this.renderEditable
              },
              {
                Header: "Name",
                accessor: "name",
                Cell: this.renderEditable,
                filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["name"] }),
                filterAll: true
              },
              {
                Header: "Brand",
                accessor: "brand",
                Cell: this.renderEditable,
                filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["brand"] }),
                filterAll: true
              },
              {
                Header: "Price",
                accessor: "price",
                Cell: this.renderEditable,
                filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["price"] }),
                filterAll: true
              },
              {
                Header: "Quantity",
                accessor: "quantity",
                Cell: this.renderEditable,
                filterMethod: (filter, rows) =>
                matchSorter(rows, filter.value, { keys: ["quantity"] }),
                filterAll: true
              },
              {
                id: "delete",
                accessor: d => (
                  <button onClick={() => this.deleteProduct(d.id)}>Delete</button>
                ),
                filterable: false
              }
            ]}
            loading={isLoading}
            defaultPageSize={10}
            className="-striped -highlight"
          />
        </div>
      </div>
    );
  };

  componentDidMount() {
    this.props.fetchData(`http://localhost:8080/api/products`);
  };

  handleSubmit = event => {
    this.props.addProduct(`http://localhost:8080/api/products`, event.name, event.brand, event.price, event.quantity);
    event.preventDefault();
  };

  deleteProduct(id) {
    this.setState({ loading: true });
    console.log('Deleting product with id = [' + id + ']');
    fetch(`http://localhost:8080/api/products/` + id,
    {
      method: 'DELETE'
    }
    )
    .then(function(response) {
      console.log('response = [' + response + ']');
      if(response.status===204) {
        return;
    }
    throw new Error('Network response was not ok.');
   }).then(() => {
      const newData = this.state.data.filter(i => i.id !== id)
      this.setState({ data: newData,
                      loading:false })
      });
  }

  exportToXLS = event => {
    console.log('Export data to xls = [' + this.selectTable.getResolvedState().sortedData + ']');
    fetch(`http://localhost:8080/api/products/export`, 
      {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(this.selectTable.getResolvedState().sortedData)
      })
      .then(function(response) {
        console.log('response = [' + response + ']');
        if(response.status===204) { //TODO change response status
          return;
      }
      throw new Error('Network response was not ok.');
     }).then(() => {
        this.setState({ loading:false })
        });
    event.preventDefault();
  }

  showLeftovers() {
    console.log('here');
  }
}

const mapStateToProps = (state) => {
  return { //TODO {state} - all fields
      data: state.data,
      hasError: state.hasError,
      isLoading: state.isLoading,
      page:state.page,
      id:state.id,
      name: state.name,
      brand:state.brand,
      price:state.price,
      quantity:state.quantity
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (url) => dispatch(productsFetchData(url)),
      addProduct: (url, name, brand, price, quantity) => dispatch(productAddNew(url, name, brand, price, quantity)),

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
