"use strict";

let myRSAKey;
let web3js;
let contract;
let methods;
let user_account;
let ownership_token_ids;
let current_token_id;
const user_account1 = "0xE30B340A0B6c94EcA7B52bE912827811c04821A1";
const user_account2 = "0x2093bf5d91568C466b6e989eC4F441d90fA1c048";
const user_account3 = "0x4D0a5243CD54a1761c8F7446392060C2D8e00b06";

const api_url = "https://64dneqe5wc.execute-api.ap-northeast-1.amazonaws.com/prod/web3node";

const output = (html) => {
    $(".output").each((i, e) => {
        $(e).html(html);
    });
};

const _o = (result) => {
    console.log(result);
    output(`${result}`);
};

const automaticCreateCommand = () => {
    contractABI.forEach((v) => {
        if (v.type === "function" && !v.payable) {
            const function_name = v.name;
            const function_arguments = v.inputs;
            const arguments_list = function_arguments.map((arg) => (`${arg.type} ${arg.name}`)).join(", ");
            const arguments_num = function_arguments.map((arg, i) => (`arguments[${i}]`)).join(", ");
            const call_type = v.constant;
            const button_color = call_type ? "btn-info" : "btn-primary";
            const call_method = call_type
                ? ".call().then(_o, _o)"
                : '.send({from: user_account})' +
                  '.on("transactionHash", console.info)' +
                  '.on("receipt", _o).on("error", _o)';
            const function_call = function () {
                // let 'methods' is the 'methods' property of the web3 contract object.
                eval(`methods.${function_name}(${arguments_num})${call_method}`);
            };

            $("#commands").append(''+
                `<div id="${function_name}" class="command">` +
                	`<button type="button" class="btn ${button_color} btn-command">${function_name}</button>` +
                	(function_arguments.length ? `<input type="text" class="textbox form-control" placeholder="${arguments_list}" value="" />` : '') +
            	'</div>'
            );
            $(".btn-command", `#${function_name}`).on("click", () => {
                function_call.apply(null, (function_arguments.length ? $(".textbox", `#${function_name}`).val() : "").split(/[\s]*,[\s]*/));
            });
        }
    });
};

const createCommand = () => {
    $("#createToken").on("click", () => {
        const f = (result) => {
            console.log(result);
            const hash = (result) ? result : "nothing"
            output("<p>申請が成功しました。約1分後に所持トークンを確認してみてください。作成が確認できたらパスワードを設定してください。</p>"
            + "<p>Transaction hash is " + hash + ".</p>");
        };
        const g = (error) => {
            console.error(error);
            output("申請に失敗しました。");
        };

        output("トークンを申請しています。申請の結果が返ってくるまでに約1分かかります。");
        createApprove(user_account).then(f, g);
    });

    /*$("#deleteToken").on("click", () => {
        output('<div id="allAuthority"></div><div id="publicKey"></div>');
        balanceOf(user_account).then((balance) => {
            console.log(balance);
            if (Number(balance) > 0) {
                output("トークンが削除されるのを待機しています。");
                deleteToken().on("receipt", (result) => {
                    console.log(result);
                    output("トークンの削除に成功しました。");
                }).on("error", (error) => {
                    console.error(error);
                    output("トークンの削除に失敗しました。");
                });
            } else if (Number(balance) === 0) {
                output("あなたはまだトークンを持っていません。");
            } else {
                output("残高が不明な値です。");
            }
        }, (error) => {
            console.error(error);
            output("残高の取得に失敗しました。");
        });
    });

    $("#checkAuthority").on("click", () => {
        ownership(user_account).then((token_ids) => {
            console.log(token_ids);
            if (token_ids.length === 0) {
                output("あなたはいまトークンを所持していません。");
            } else if (token_ids.indexOf(current_token_id) > -1) {
                checkAuthority(current_token_id).then((authority) => {
                    console.log(authority);
                    output("<p>あなたが持っている権限は次のとおりです。<ul>"
                        + "<li>国の管理権限：" + (authority.indexOf(1) ? "あり" : "なし") + "</li>"
                        + "<li>株の所有：" + (authority.indexOf(2) ? "あり" : "なし") + "</li>"
                        + "<li>会社権限：" + (authority.indexOf(3) ? "あり" : "なし") + "</li>"
                        + "</ul></p>");
                }, (error) => {
                    console.error(error);
                    output("トークンの取得に失敗しました");
                });
            } else {
                output("あなたはいまトークン(ID: " + current_token_id + ")を所持していません。");
            }
        }, (error) => {
            console.error(error);
            output("残高の取得に失敗しました。");
        });
    });


    $("#getTotalSupply").on("click", () => {
        getTotalSupply().then((result) => {
            console.log(result);
            output("ただいまのトークン総発行数は " + result + " 枚です。");
        }, (error) => {
            console.error(error);
            output("総発行量の取得に失敗しました");
        });
    });

    $("#transfer").on("click", () => {
        const to_address = $("#to-address-input").val();
        console.log(to_address);
        if (to_address) {
            ownership(user_account).then((token_ids) => {
                console.log(token_ids);
                if (token_ids.indexOf(current_token_id) > -1) {
                    output("トークンが送金されるのを待機しています。");
                    transfer(to_address, token_id).on("receipt", (result) => {
                        console.log(result);
                        output("トークンを " + to_address + " に送金しました。");
                    }).on("error", (error) => {
                        console.error(error);
                        output("トークンの送金に失敗しました。");
                    });
                }
            }, (error) => {
                console.error(error);
                output("あなたはトークンを持っていません。");
            });
        } else {
            output("宛先を入力してください。");
        }
    });

    $("#changePublicKey").on("click", () => {
        const password = $("#new-password-input").val();
        console.log(password);
        if (password.length > 0) {
            ownership(user_account).then((token_ids) => {
                console.log(token_ids);
                if (token_ids.indexOf(current_token_id) > -1) {
                    output("パスワードが変更されるのを待機しています。");
                    myRSAKey = keyGen(password);
                    const n = myRSAKey.n.toString();
                    const e = myRSAKey.e;
                    refleshPublicKey(current_token_id, n, e).on("receipt", (result) => {
                        console.log(result);
                        localStorage.setItem("RSAKey", stringifyRSAKey(myRSAKey));
                        output("<p>パスワードを" + password + "に変更しました。</p>");
                    }).on("error", (error) => {
                        console.error(error);
                        output("パスワードの変更に失敗しました。");
                    });
                }
            }, (error) => {
                console.error(error);
                output("あなたはいまそのトークンを持っていません。");
            });
        } else {
            output("パスワードを入力してください。");
        }
    });
    */
    $("#requestInfo").on("click", () => {
        output("残高を取得しています。");
        methods.balanceOf(user_account).call().then((balance) => {
            console.log(balance);
            if (Number(balance) > 0) {
                const f = (res) => {
                    const signed_url = decrypto(JSON.parse(res).result);
                    console.log(signed_url);
                    window.open(signed_url);
                    output("データが取得できました。新しい画面が開いて中身を確認できるはずです。");
                };
                const g = (error) => {
                    console.error(error);
                    output("データが取得できませんでした。");
                };

                output("暗号化されたデータを解読中です。");
                requestInfo(user_account).then(f, g);
            } else if (Number(balance) === 0) {
                output("あなたはまだトークンを持っていません。");
            } else {
                output("残高が不明な値です。");
            }
        });
    });
};

/*
const getTotalSupply = () => methods.getTotalSupply().call();
const balanceOf = (owner) => methods.balanceOf(owner).call();
const ownership = (owner) => methods.ownership(owner).call();
const ownerOf = (token_id) => methods.ownerOf(token_id).call();
const transfer = (to, token_id) => methods.transfer(to, token_id).send({from: user_account});
const approve = (to, token_id) => methods.approve(to, token_id).send({from: user_account});
const takeOwnership = (token_id) => methods.takeOwnership(token_id).send({from: user_account});
const createToken = (approver, authority, administer) => methods.createToken(approver, authority, administer).send({from: user_account});
const deleteToken = (token_id) => methods.deleteToken(token_id).send({from: user_account});
const addAdminister = (token_id, administers) => methods.addAdminister(token_id, administers).send({from: user_account});
const changeAdminister = (token_id, administers) => methods.changeAdminister(token_id, administers).send({from: user_account});
const addAuthority = (token_id, authority) => methods.addAuthority(token_id, authority).send({from: user_account});
const changeAuthority = (token_id, changeAuthority) => methods.changeAdminister(token_id, authority).send({from: user_account});
const checkAuthority = (token_id) => methods.checkAuthority(token_id).call();
const checkAdministers = (token_id) => methods.checkAdministers(token_id).call();
const checkPublicKey = (token_id) => methods.checkPublicKey(token_id).call();
const refleshPublicKey = (token_id, n_of_public_key, e_of_public_key) => methods.refleshPublicKey(token_id, n_of_public_key, e_of_public_key).send({from: user_account});
*/
const createApprove = (owner) => {
    const resource_name = "/createapprove";
    const data = JSON.stringify({
        claimant: encodeURIComponent(owner),
        name: "create"
    });
    const header = {
        url: api_url + resource_name,
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        crossDomain: true,
        cache: false,
        data: data
    };

    return $.ajax(header);
};

const requestInfo = (owner) => {
    const resource_name = "/requestinfo";
    const data = {
        token_id: current_token_id,
        name: "111"
    };
    const header = {
        url: api_url + resource_name,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        crossDomain: true,
        cache: false,
        data: data
    };

    return $.ajax(header);
};

const parseRSAKey = (key_json) => {
    const key_obj = JSON.parse(key_json);
    return {
        coeff: new BigInteger(key_obj.coeff),
        d: new BigInteger(key_obj.d),
        dmp1: new BigInteger(key_obj.dmp1),
        dmq1: new BigInteger(key_obj.dmq1),
        e: key_obj.e,
        n: new BigInteger(key_obj.n),
        p: new BigInteger(key_obj.p),
        q: new BigInteger(key_obj.q)
    };
};

const stringifyRSAKey = (rsa_key) => JSON.stringify({
    coeff: rsa_key.coeff.toString(),
    d: rsa_key.d.toString(),
    dmp1: rsa_key.dmp1.toString(),
    dmq1: rsa_key.dmq1.toString(),
    e: rsa_key.e,
    n: rsa_key.n.toString(),
    p: rsa_key.p.toString(),
    q: rsa_key.q.toString()
});

const keyGen = (pass) => cryptico.generateRSAKey(pass, 1024);

const splitByLength = (str, length) => {
    let resultArr = [];
    if (!str || !length || length < 1) {
        return resultArr;
    }
    let index = 0;
    let end = str.length;
    let start = end - length;
    while (end > 0) {
        resultArr[index] = str.substring(start, end);
        index++;
        end = start;
        start = end - length;
    }
    return resultArr;
};

const decrypto = (encoded_url_list) => {
    if (myRSAKey) {
        const d = myRSAKey.d;
        const n = myRSAKey.n;
        let result_url = "";
        encoded_url_list.forEach((url_segment) => {
            const m = new BigInteger(url_segment);
            const result_url_split = splitByLength(m.modPow(d, n).toString(), 4).map((char) => {
                return String.fromCharCode(Number(char));
            });
            let result = result_url_split.join("");
            result_url += result;
        });
        return result_url;
    } else {
        alert("鍵を作成して下さい");
    }
};

$(() => {
    try {
        myRSAKey = parseRSAKey(localStorage.getItem("RSAKey"));
    } catch (e) {
        console.log("RSAキーが取得できません。");
    }

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/"));;
    }

    contract = new web3js.eth.Contract(contractABI, contractAddress);
    methods = contract.methods;

    web3js.eth.getAccounts((error, accounts) => {
        if (!error) {
            user_account = accounts[0];
            automaticCreateCommand();
            createCommand();
            methods.ownership(user_account).call().then((token_ids) => {
                ownership_token_ids = token_ids;
                current_token_id = (token_ids) ? token_ids[0] : NaN;
            }, (error) => {
                console.error(error);
                output("トークンの取得に失敗しました。");
            });
        } else {
            console.error(error);
            output("アカウントが指定されていません。");
        }
    });
});
