import React, { Component } from "react";
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { AvForm, AvField } from 'availity-reactstrap-validation';
import ReactTable from "react-table";
import "react-table/react-table.css";
import axios from "axios";
import { get as _get, isEmpty as _isEmpty } from "lodash";
import { fromByteArray } from "base64-js";
// import { clearConfigCache } from "prettier";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxes, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

class App extends Component {
  baseUrl = 'http://localhost:8080';
  constructor(props) {
    super(props);
    this.state = {
      inventoryData: [],
      isModalOpen: false,
      image: null,
      ByteArray: null,
      updateEntity: []
    };
  }

  handleDelete = (row) => {
    const Isconfirm = window.confirm("Are you sure you want to delete this record");
    if (_get(row, 'id') && Isconfirm) {
      // axios.delete(this.baseUrl + `delete/${row.id}`)
      axios.delete(this.baseUrl + `/delete/${row.id}`).then(res => {
        const newData = _get(res, 'data', []);
        this.setState({
          inventoryData: newData
        })
        toast.info('Record Deleted', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
    }
  }
  handleUpdate = (row) => {
    this.setState({
      updateEntity: row,
      isModalOpen: !this.state.isModalOpen
    })
  }
  componentDidMount() {
    axios.get(this.baseUrl + '/findall').then((res) => {
      const inventoryData = _get(res, "data", [])
      this.setState({
        inventoryData
      })
    }).catch((e) => {
    });
  }
  toggle = () => {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    }, () => {
      if (!this.state.isModalOpen) {
        this.setState({
          updateEntity: []
        })
      }
    });
  }
  handleValidSubmit = (events, values) => {
    const checkExist = this.state.inventoryData.filter(x => x.itemname.toLowerCase() === values.itemName.toLowerCase());
    if (checkExist.length > 0) {
      this.setState({
        isModalOpen: !this.state.isModalOpen
      })
      toast.error('Record already exists', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    const obj = {}
    obj['id'] = Math.round(Math.random() * 10000);
    obj['itemname'] = values.itemName;
    obj['itemStatus'] = values.itemStatus;
    obj['itemStock'] = parseInt(values.itemStock);
    obj['image'] = _get(this.state, 'ByteArray') === null ? null : fromByteArray(_get(this.state, 'ByteArray'));
    var axios = require('axios');
    var data = JSON.stringify(obj)

    var config = {
      method: 'post',
      url: this.baseUrl + '/save',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        const result = response.data
        return result
      }).then((res) => {
        this.setState({
          inventoryData: res,
          isModalOpen: false,
          image: null,
          ByteArray: []
        })
        toast.success('Record Created', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "Dark",
        });
      })
      .catch(function (error) {
      });
  }
  handleupdateStatus = (events, values) => {
    var data = values.itemStatus;
    var config = {
      method: 'put',
      url: this.baseUrl + `/updateStatus/${this.state.updateEntity['id']}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        const result = response.data
        return result
      }).then((res) => {
        this.setState({
          inventoryData: res,
          isModalOpen: false,
          updateEntity: []
        })
        toast.success('Status updated', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch(function (error) {
      });
  }
  readFileDataAsBase64 = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = new Uint8Array(reader.result);
        this.setState({
          ByteArray: imageData
        })
      };
      reader.readAsArrayBuffer(file);
    }
  }
  openModal = () => (
    <>
      <Modal isOpen={this.state.isModalOpen} toggle={this.toggle} >
        <ModalHeader>{!_isEmpty(this.state.updateEntity) ? 'Update Status' : 'Add Item'}</ModalHeader>
        <ModalBody>
          <AvForm id="addItem-form" onValidSubmit={!_isEmpty(this.state.updateEntity) ? this.handleupdateStatus : this.handleValidSubmit}>
            {!_isEmpty(this.state.updateEntity) ? '' : <Input
              id="exampleFile"
              name="file"
              type="file"
              onChange={(event) => {
                this.readFileDataAsBase64(event)
                // this.setState({
                //   image:this.getBase64(event.target.files[0])
                // });
              }}
            />}
            <AvField
              name="itemName"
              label="Name"
              required
              placeholder="Enter item Name"
              disabled={!_isEmpty(this.state.updateEntity)}
              value={this.state.updateEntity['itemname']}
            />
            <AvField
              name="itemStatus"
              label="Status"
              placeholder="Enter item Status"
              required
              value={this.state.updateEntity['itemStatus']}
            />
            <AvField
              name="itemStock"
              label="Stock"
              type="number"
              placeholder="Enter item Quantity"
              required
              disabled={!_isEmpty(this.state.updateEntity)}
              value={this.state.updateEntity['itemStock']}
            />
            <Button type="submit" color="primary" >
              submit
            </Button>
          </AvForm>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
  ActionBtnEdit = (row) => (
    <div>
      <>
        <Button color="primary" size="sm" onClick={e => this.handleUpdate(row.original)}><FontAwesomeIcon icon={faPencil} /></Button>
      </> &nbsp;
      <>
        <Button color="danger" size="sm" onClick={e => this.handleDelete(row.original)}><FontAwesomeIcon icon={faTrash} /></Button>
      </>
    </div>
  )
  displayImage = (row) => (
    <div>
      {row.original.image !== null ? <>
        <img width="50" src={'data:image/png;base64,' + row.original.image} alt="" />
      </> :
        <>
          <FontAwesomeIcon size="xl" icon={faBoxes} alt="" />
        </>}
    </div>
  )
  render() {
    const inventoryData = this.state.inventoryData;
    return (
      <div className="App">
        <h1>Inventory Managment</h1>
        <Button color="primary" onClick={this.toggle}>Add Item</Button>
        {this.openModal()}
        <ReactTable
          className="-striped"
          columns={[
            {
              Header: "Item Image",
              id: "image",
              accessor: "image",
              Cell: this.displayImage,
              // accessor: 'deviceName',
              className: "text-center"
            },
            {
              Header: "Item Name",
              id: "itemname",
              accessor: "itemname",
              // Cell: this.DeviceEditField,
              // accessor: 'deviceName',
              className: "text-center"
            },
            {
              Header: "Item Status",
              id: "itemStatus",
              accessor: "itemStatus",
              // Cell: this.DeviceEditField,
              // accessor: 'deviceName',
              className: "text-center"
            },
            {
              Header: "Item Stock",
              id: "itemStock",
              accessor: "itemStock",
              // Cell: this.DeviceEditField,
              // accessor: 'deviceName',
              className: "text-center"
            },
            {
              Header: "Action",
              accessor: "_id",
              width: 90,
              fixed: "right",
              Cell: this.ActionBtnEdit
            }
          ]}
          data={inventoryData}
          filterable={false}
          sortable={false}
          showPageSizeOptions={false}
          pagsize
          showPagination={false}
        // onPageChange={this.onPageChange}
        // onPageSizeChange={this.onPageSizeChange}
        // defaultPageSize={7}
        // pages={_get(this.props, 'objectDataList._total_pages', 1)}
        // page={this.state.pageNo}
        // manual
        // onFetchData={this.fetchData}
        />
      </div>
    );
  }
}

export default App;
