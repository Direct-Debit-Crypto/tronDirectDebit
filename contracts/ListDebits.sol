//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;



// This should be deploy only once per Direct Debit platform
contract ListDebitors {

    //Mapping between an adress and possible 
    uint maxNumbersOfSmartContractAllowed = 0;

    mapping(address => uint) public smartContractDebitorArrayIndex;
    mapping(address => string) public smartContractDebitorArrayTags;
    mapping(address => address[]) public smartContractDebitorList;


    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event SmartContractDebitorSet(address indexed _setter, address indexed _smartContractDebitor);

    /**
     * Contract initialization.
     */
    constructor(uint maxNumberDebitors) {
        // Max number of Debitors
        maxNumbersOfSmartContractAllowed = maxNumberDebitors;
    }

    /**
     * A function to set the smart Contract Debitor
     *
     */
    function setSmartContractDebitor(address smartContractDebitorInput, string memory _tag) external returns (string memory)  {

        string memory stringReturned = "No response";

        //Get the current index of the array
        uint index = smartContractDebitorArrayIndex[msg.sender];

        if (index >= maxNumbersOfSmartContractAllowed) 
            stringReturned = "Maximum number of Debitors reach. The address was not added.";
        else if (index == 0)
        {
            smartContractDebitorList[msg.sender] = [smartContractDebitorInput];    
            stringReturned = "First address of Debitor set.";
            smartContractDebitorArrayTags[smartContractDebitorInput] = _tag;
            // Notify off-chain applications of the transfer.
            emit SmartContractDebitorSet(msg.sender, smartContractDebitorInput);
        }
        else
        {
            address[] memory currentlistOfDebitors = new address[](maxNumbersOfSmartContractAllowed);

            //Copy the current array
            for (uint i = 0; i < smartContractDebitorList[msg.sender].length; i++)
            {
                currentlistOfDebitors[i] = smartContractDebitorList[msg.sender][i];
            }

            // currentlistOfDebitors = smartContractDebitorList[msg.sender];

            currentlistOfDebitors[index] = smartContractDebitorInput;
            smartContractDebitorList[msg.sender] = currentlistOfDebitors;
            stringReturned = "New address added.";


            // Notify off-chain applications of the transfer.
            emit SmartContractDebitorSet(msg.sender, smartContractDebitorInput);
        }

        // Increase index
        smartContractDebitorArrayIndex[msg.sender] = index + 1;

        return stringReturned;
    }
    
    /**
     * Read only function to retrieve the smartContract address for an input address and index.
     *
     */
    function getSmartContractProvicer(address accountInput,uint _index) external view returns (address) {
        return smartContractDebitorList[accountInput][_index];
    }

    
    /**
     * Read only function to retrieve all the smartContract addresses for an input address.
     *
     */
    function getAllSmartContractProvicer(address accountInput) external view returns (address[] memory) {
        return smartContractDebitorList[accountInput];
    }

    
    /**
     * Read only function to retrieve the smartContract address for my address and a certain index.
     *
     */
    function getMySmartContractProvicer(uint _index) external view returns (address) {
        return smartContractDebitorList[msg.sender][_index];
    }

    
    /**
     * Read only function to retrieve the address of all the smartContract addresses.
     *
     */
    function getAllMySmartContractProvicer() external view returns (address[] memory) {
        return smartContractDebitorList[msg.sender];
    }


    /**
     * Read only function to retrieve the address of all the smartContract addresses.
     *
     */
    function getTagForAddress(address _address) external view returns (string memory) {
        return smartContractDebitorArrayTags[_address];
    }


    /**
     * Read only function to retrieve the address of all the smartContract addresses.
     *
     */
    function getAllTags() external view returns (string[] memory) {
        string[] memory all_tags = new string[](smartContractDebitorList[msg.sender].length);
        for (uint i = 0; i < smartContractDebitorList[msg.sender].length; i++)
        {
            all_tags[i] = smartContractDebitorArrayTags[smartContractDebitorList[msg.sender][i]];
        }
        return all_tags;
    }
}