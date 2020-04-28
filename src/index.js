import React, { Component } from "react"
import ReactDOM from "react-dom"
import BigNumber from 'bignumber.js'
import ABICoder from '@makkii/aion-web3-avm-abi'
import "makkii-webview-bridge";

const CONTRACT = "0xa0c52ed6f7216907e1c5cc01031e0f98b84aa711d668261556ead703db434ec1"
const BN_AION = new BigNumber("1000000000000000000")
const abi = new ABICoder()

class Index extends Component {

    constructor() {
        super()
        this.state = {
            account: '',
            count: 0,
            recipients:[],
            amounts:[],
            preview:[],
            value: new BigNumber(0),
        }
    }

    componentDidMount() {
        makkii
        .getCurrentAccount()
        .then(account => {
            this.setState({
                account
            })
        })
    }

    batch_send() {
      try {
        const data = abi.encodeMethod(
            'send',
            ['address[]', 'biginteger[]'],
            [this.state.recipients, this.state.amounts])
        let tx = {
            to: CONTRACT,
            amount: this.state.value,
            type: 1,
            gasPrice: "10000000000",
            gasLimit: "2000000",
            data
        }
        makkii
        .sendTx(tx)
        .then(data => {
            alert('[transaction-hash] ' + data)
        })
        .catch(err => {
            alert('[batch_create] err ' + JSON.stringify(err))
        })
      } catch (err) {
        alert("encode error:" + JSON.stringify(err));
      }
    }

    render() {
        let parent = this
        return (
            <div style={{padding:"0 0 10px 0"}}>
                <div>
                    <div>
                        <div style={{padding:"10px", fontSize:'20px', lineHeight:"25px"}}>
                            <span>Batch</span> <small>(max 80 records per batch)</small>
                        </div>
                    </div>
                </div>
                <div >
                    <table >
                        <tr>
                            <td>Contract Address</td>
                            <td><input style={{width:'100%'}} value={CONTRACT} disabled /></td>
                        </tr>
                        <tr>
                            <td><button className="primary" onClick={e=>{
                                makkii.switchAccount()
                                .then(account => {
                                    this.setState({
                                        account
                                    })
                                })
                                .catch(err => {
                                    console.log('[switch-account] err', err)
                                })

                            }}>Switch Account</button></td>
                            <td><input style={{width:'100%'}}  value={this.state.account} disabled /></td>
                        </tr>
                        <tr>
                            <td>Upload CSV</td>
                            <td>
                                <input 
                                    style={{
                                        border: ".0625rem solid var(--input-border-color)",
                                        padding: "7px 0"
                                    }}
                                    type="file" id="csv" onChange={(e)=>{   
                                    let input_file = document.querySelector('#csv').files[0]        
                                    let reader = new FileReader()
                                    reader.onload = function(){
                                        let lines = reader.result.split(/\s+/).filter(v => Boolean(v))
                                        let count = lines.length
                                        if(count > 80) 
                                            alert('[80-records-max]')
                                        else {

                                            let recipients = [], preview = []
                                            let amounts = []
                                            let value = new BigNumber(0)

                                            for(let i = 0; i < count; i++){
                                              console.log("line:", lines[i]);
                                                let recipient = lines[i].split(',')
                                                let address = recipient[0]
                                                let amount = recipient[1]
                                                let amount_bn = new BigNumber(amount).multipliedBy(BN_AION) 
                                                recipients.push(address)
                                                amounts.push(amount_bn)
                                                value = value.plus(amount) 
                                                if (i < 3)
                                                    preview.push({ address, amount })
                                            }

                                            parent.setState({
                                                recipients,
                                                amounts,
                                                preview,
                                                count,
                                                value
                                            })

                                        }
                                        input_file.value = null
                                    }
                                    reader.readAsText(input_file)
                                }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Recipients ({this.state.count})</td>
                            <td>
                                <ul>
                                    {
                                        this.state.preview.map((v,k)=>{
                                            return(
                                                <li key={k}>
                                                    {v.address.substring(0, 8)} ... {v.address.substring(60, 66)} {v.amount} AION
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                                {
                                    this.state.count > 3 ?
                                    <div style={{
                                        textAlign: 'center',
                                        paddingBottom: '20px'
                                    }}>...</div> : ''
                                }
                            </td>
                        </tr>
                        <tr>
                            <td>Total Amount</td>
                            <td>{this.state.value.toFixed(6)} <small>+ 0.02</small> AION</td>
                        </tr>
                    </table>
                </div>
                <div className="row">
                    <button className="primary" style={{width: "100%"}} onClick={(e)=>{
                        this.batch_send()
                        e.preventDefault()
                    }}>Send</button>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById("app"))