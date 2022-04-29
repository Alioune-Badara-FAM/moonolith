import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import contractABI from '../utils/abi.json';
import { base64ToBuffer, bufferOnMonolith } from './imageManager';
import Const from '../models/constants';
import { increaseMonolithHeight } from '../models/monolith';

const provider = new ethers.providers.InfuraProvider('rinkeby');
const iface = new Interface(contractABI);
const contractAddress = '0xf727151C96eCA0Fe0D8f3c3b603647460cb2b3A0';
const contract = new ethers.Contract(contractAddress, contractABI, provider);
let metamaskProvider;
var metamaskContract;

if (window.ethereum) {
    metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner();
    metamaskContract = new ethers.Contract(contractAddress, contractABI, signer);
}

let importedChunks = 1;

const chunkCreator = async (res) => {
    if (window.ethereum.chainId == '0x4') {
        await metamaskProvider.send('eth_requestAccounts', []);
        const oneGwei = ethers.BigNumber.from('1000000000');
        let overrides = {
            value: oneGwei.mul(res.nbPix),
        };
        // console.log('Minting: ', res.position, res.ymax, res.nbPix, res.imgURI);
        let tx = metamaskContract.mint_One_4d(res.position, res.ymax, res.nbPix, res.imgURI, overrides);
    } else {
        alert("Mets le testnet l'ami");
    }
};

/**
 * Demande les données d'un chunk
 * @param {numero du dessin} id
 * @returns {position, ymax, nbPix, string de l'image}
 */
const getChunk = async (id) => {
    let data = await contract.queryFilter(contract.filters.Chunk(id));
    let topics = data[0].topics;
    data = data[0].data;
    let res = iface.parseLog({ data, topics }).args;
    res = res.slice(1);
    return res;
};

const getChunksFromPosition = async (min, max) => {
    let res = [];
    for (let i = min; i <= max; i++) {
        let data = await contract.queryFilter(contract.filters.Chunk(null, i));
        if (data.length > 0) {
            let topics = data[0].topics;
            data = data[0].data;
            let chunk = iface.parseLog({ data, topics }).args;
            console.log(chunk);
            chunk = chunk.slice(1);
            res.push(chunk);
        }
    }
    console.log(res);
    return res;
};

async function getMetaData() {
    let metadata = await contract.getMonolithInfo();
    // console.log(metadata);
    return { nbKlon: metadata[2].toNumber(), threshold: metadata[1].toNumber(), nbChunks: metadata[0].toNumber() };
}

async function chunkImport() {
    let meta = await getMetaData();
    //console.log(meta);
    // console.log('importedChunks', importedChunks, 'meta.nbChunks', meta.nbChunks);
    if (importedChunks !== meta.nbChunks || importedChunks == 1) {
        for (let i = importedChunks; i <= meta.nbChunks; i++) {
            getChunk(i).then((res) => {
                bufferOnMonolith({
                    buffer: base64ToBuffer(res[4]),
                    x: res[0].toNumber() % Const.MONOLITH_COLUMNS,
                    y: Math.floor(res[0].toNumber() / Const.MONOLITH_COLUMNS),
                    paid: res[3].toNumber(),
                    yMaxLegal: res[2].toNumber() / 1000000,
                    zIndex: i,
                });
            });
        }
    }
    importedChunks = meta.nbChunks;

    const monolithHeightFormula = Const.COLUMNS * 64 + (meta.nbKlon * meta.threshold) / 1000000;
    const monolithHeight = Math.floor(monolithHeightFormula / Const.COLUMNS);
    if (monolithHeight - Const.MONOLITH_LINES) {
        increaseMonolithHeight(monolithHeight - Const.MONOLITH_LINES);
    } else {
        Const.setMonolithHeight(monolithHeight);
    }
}

export { chunkCreator, getChunk, getChunksFromPosition, chunkImport };
