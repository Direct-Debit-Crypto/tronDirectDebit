//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;



// This is the main building block for smart contracts.
// This should be deploy only once per Direct Debit platform
contract ListProviders {

    //Mapping between an adress and possible 
    uint maxNumbersOfSmartContractAllowed = 0;

    mapping(address => uint) public smartContractProviderArrayIndex;
    mapping(address => address[]) public smartContractProviderList;


    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event SmartContractProviderSet(address indexed _setter, address indexed _smartContractProvider);

    /**
     * Contract initialization.
     */
    constructor(uint maxNumberProviders) {
        // Max number of Providers
        maxNumbersOfSmartContractAllowed = maxNumberProviders;
    }

    /**
     * A function to set the smart Contract Provider
     *
     */
    function setSmartContractProvider(address smartContractProviderInput) external returns (string memory)  {

        string memory stringReturned = "No response";

        //Get the current index of the array
        uint index = smartContractProviderArrayIndex[msg.sender];

        if (index >= maxNumbersOfSmartContractAllowed) 
            stringReturned = "Maximum number of Providers reach. The address was not added.";
        else if (index == 0)
        {
            smartContractProviderList[msg.sender] = [smartContractProviderInput];    
            stringReturned = "First address of provider set.";
            // Notify off-chain applications of the transfer.
            emit SmartContractProviderSet(msg.sender, smartContractProviderInput);
        }
        else
        {
            address[] memory currentlistOfProviders = new address[](maxNumbersOfSmartContractAllowed);

            //Copy the current array
            for (uint i = 0; i < smartContractProviderList[msg.sender].length; i++)
            {
                currentlistOfProviders[i] = smartContractProviderList[msg.sender][i];
            }

            // currentlistOfProviders = smartContractProviderList[msg.sender];

            currentlistOfProviders[index] = smartContractProviderInput;
            smartContractProviderList[msg.sender] = currentlistOfProviders;
            stringReturned = "New address added.";


            // Notify off-chain applications of the transfer.
            emit SmartContractProviderSet(msg.sender, smartContractProviderInput);
        }

        // Increase index
        smartContractProviderArrayIndex[msg.sender] = index + 1;

        return stringReturned;
    }
    
    /**
     * Read only function to retrieve the smartContract address for an input address and index.
     *
     */
    function getSmartContractProvicer(address accountInput,uint _index) external view returns (address) {
        return smartContractProviderList[accountInput][_index];
    }

    
    /**
     * Read only function to retrieve all the smartContract addresses for an input address.
     *
     */
    function getAllSmartContractProvicer(address accountInput) external view returns (address[] memory) {
        return smartContractProviderList[accountInput];
    }

    
    /**
     * Read only function to retrieve the smartContract address for my address and a certain index.
     *
     */
    function getMySmartContractProvicer(uint _index) external view returns (address) {
        return smartContractProviderList[msg.sender][_index];
    }

    
    /**
     * Read only function to retrieve the address of all the smartContract addresses.
     *
     */
    function getAllMySmartContractProvicer() external view returns (address[] memory) {
        return smartContractProviderList[msg.sender];
    }
}