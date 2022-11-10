//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;



// This is the main building block for smart contracts.
// This should be deploy only once per Direct Debit platform
contract ListVendors {

    //Mapping between an adress and possible 
    uint maxNumbersOfSmartContractAllowed = 0;

    mapping(address => uint) public smartContractVendorArrayIndex;
    mapping(address => address[]) public smartContractVendorList;


    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event SmartContractVendorSet(address indexed _setter, address indexed _smartContractVendor);

    /**
     * Contract initialization.
     */
    constructor(uint maxNumberVendors) {
        // Max number of Vendors
        maxNumbersOfSmartContractAllowed = maxNumberVendors;
    }

    /**
     * A function to set the smart Contract Vendor
     *
     */
    function setSmartContractVendor(address smartContractVendorInput) external returns (string memory)  {

        string memory stringReturned = "No response";

        //Get the current index of the array
        uint index = smartContractVendorArrayIndex[msg.sender];

        if (index >= maxNumbersOfSmartContractAllowed) 
            stringReturned = "Maximum number of Vendors reach. The address was not added.";
        else if (index == 0)
        {
            smartContractVendorList[msg.sender] = [smartContractVendorInput];    
            stringReturned = "First address of Vendor set.";
            // Notify off-chain applications of the transfer.
            emit SmartContractVendorSet(msg.sender, smartContractVendorInput);
        }
        else
        {
            address[] memory currentlistOfVendors = new address[](maxNumbersOfSmartContractAllowed);

            //Copy the current array
            for (uint i = 0; i < smartContractVendorList[msg.sender].length; i++)
            {
                currentlistOfVendors[i] = smartContractVendorList[msg.sender][i];
            }

            // currentlistOfVendors = smartContractVendorList[msg.sender];

            currentlistOfVendors[index] = smartContractVendorInput;
            smartContractVendorList[msg.sender] = currentlistOfVendors;
            stringReturned = "New address added.";


            // Notify off-chain applications of the transfer.
            emit SmartContractVendorSet(msg.sender, smartContractVendorInput);
        }

        // Increase index
        smartContractVendorArrayIndex[msg.sender] = index + 1;

        return stringReturned;
    }
    
    /**
     * Read only function to retrieve the smartContract address for an input address and index.
     *
     */
    function getSmartContractProvicer(address accountInput,uint _index) external view returns (address) {
        return smartContractVendorList[accountInput][_index];
    }

    
    /**
     * Read only function to retrieve all the smartContract addresses for an input address.
     *
     */
    function getAllSmartContractProvicer(address accountInput) external view returns (address[] memory) {
        return smartContractVendorList[accountInput];
    }

    
    /**
     * Read only function to retrieve the smartContract address for my address and a certain index.
     *
     */
    function getMySmartContractProvicer(uint _index) external view returns (address) {
        return smartContractVendorList[msg.sender][_index];
    }

    
    /**
     * Read only function to retrieve the address of all the smartContract addresses.
     *
     */
    function getAllMySmartContractProvicer() external view returns (address[] memory) {
        return smartContractVendorList[msg.sender];
    }
}