import { Tabs, Tab, Toast, Col, Row } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import bank from '../bank.png';
import Web3 from 'web3';
import './App.css';

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum!=='undefined'){
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()

      //load balance
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with MetaMask')
      }

      //load contracts
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }
  handleAccount=()=>{
    if(this.state.account===''){
      this.setState({
        data: 'Yêu cầu kết nối đến tài khoản bằng Metamask!',
        show: true,
        status:1
      })
    }
  }

  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
        this.setState({
          data: 'Gửi tiền thành công',
          show: true,
          status:0
        })
      } catch (e) {
        console.log('Error, deposit: ', e)
        this.handleAccount()
      }
    }
  }

  async withdraw(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
        this.setState({
          data: 'Rút tiền thành công',
          show: true
        })
      } catch(e) {
        console.log('Error, withdraw: ', e)
        this.setState({
          data: 'Bạn chưa gửi tiền',
          show: true,
          status: 1
        })
        this.handleAccount()
      }
    }
  }

  async borrow(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
        this.setState({
          data: 'Thế chấp thành công',
          show: true,
          status: 0
        })
      } catch (e) {
        console.log('Error, borrow: ', e)
        this.setState({
          data: 'Bạn cần nhập số tiền mà bạn có thể thế chấp!',
          show: true,
          status: 1
        })
        this.handleAccount()
      }
    }
  }

  async payOff(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
        const tokenBorrowed = collateralEther*3/4
        await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
        await this.state.dbank.methods.payOff().send({from: this.state.account})
        this.setState({
          data: 'Trả khoản vay thành công',
          show: true,
          status: 0
        })
      } catch(e) {
        console.log('Error, pay off: ', e)
        this.setState({
          data: 'Bạn chưa từng thế chấp!',
          show: true,
          status: 1
        })
        this.handleAccount()
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      show:false,
      data:'',
      status: 0
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        {/* toast */}
          <div className='toast-alert'>
              <Row>
                <Col xs={8}>
                  <Toast onClose={()=>this.setState({ show: false })} show={this.state.show} delay={3000} autohide>
                    <Toast.Header className= {this.state.status===0? 'toast-alert-header-success': 'toast-alert-header-deny'}>
                      <strong className="me-auto">Thông báo</strong>
                    </Toast.Header>
                    <Toast.Body>{this.state.data}</Toast.Body>
                  </Toast>
                </Col>
              </Row>
          </div>
         
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={bank} className="App-logo" alt="logo" height="50"/>
          <b>Decentralized Bank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to Decentralized Bank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit"> 
                  <div>
                  <br></br>
                    Bạn muốn gửi bao nhiêu tiền?
                    <br></br>
                    (Tối thiểu là 0.01 ETH)
                    <br></br>
                    (Có thể gửi 1 lần)
                    <br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.depositAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                    </form>

                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                  <br></br>
                    Bạn muốn rút tiền + lãi suất
                    <br></br>
                    <br></br>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>
                <Tab eventKey="borrow" title="Borrow">
                  <div>
                  <br></br>
                    Bạn có muốn mượn token không?
                    <br></br>
                    (Bạn sẽ nhận được 75% tài sản thế chấp, bằng Token)
                    <br></br>
                    Nhập số tiền thế chấp (bằng ETH)
                    <br></br>
                    <br></br>
                    <form onSubmit={(e) => {

                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10 **18 //convert to wei
                      this.borrow(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>BORROW</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="Payoff">
                  <div>

                  <br></br>
                  Bạn có muốn trả hết khoản vay không?
                    <br></br>
                    (Bạn sẽ nhận được tài sản thế chấp của mình - phí)
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.payOff(e)}>PAYOFF</button>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
