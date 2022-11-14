//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;



// This is the DirectDebit Contract
contract DirectDebit {

    uint maxNumberVendor;
    bool payLater;
    address owner;
    uint public treasure;
    mapping(address => uint) public vendorsMaxLimit;
    mapping(address => uint) public vendorsInvoicesUsedLimit;
    address[] vendorsList;

    modifier onlyOwner {
        require(msg.sender == owner, "Ownable: You are not the owner.");
        _;
    }

    constructor(uint _maxNumberVendor, bool _payLater) {
        maxNumberVendor = _maxNumberVendor;
        payLater = _payLater;
        owner = msg.sender;
    }

    //You can deposit from any address
    function deposit() public payable{
        treasure += msg.value;
    }

    function withdraw(uint _amount) public onlyOwner {
        treasure -= _amount;

        address payable ownerPaid = payable(msg.sender);
        ownerPaid.transfer(_amount);

    }

    // Set an invoice (only vendors can do that)
    function setInvoice(uint _amount) external returns (string memory)  {

        //check if is a whitelisted vendor and that did not reach the maximum number of invoices
        require(vendorsMaxLimit[msg.sender] > 0, "You are not a valid vendor.");
        require(vendorsInvoicesUsedLimit[msg.sender] + _amount <= vendorsMaxLimit[msg.sender], "You reach you maximum amount alocated.");

        // Increase the used limits
        vendorsInvoicesUsedLimit[msg.sender] = vendorsInvoicesUsedLimit[msg.sender] + _amount;

        //pay later or right away
        if (payLater == false)
        {
            //Pay the account
            address payable vendor = payable(msg.sender);
            vendor.transfer(_amount);
            treasure -= _amount;
            return "Your invoice was paid.";

        }
        
        return "Your invoice was saved.";
        
    }

    // For payLater pay functionality for all vendors at once
    function payAllVendors() onlyOwner external{
        require(payLater==false, "This is available only for payLater feature");
        
        //Iterate and pay vendors 
        for (uint i = 0; i < vendorsList.length; i++)
        {
            address payable vendor = payable(vendorsList[i]);
            vendor.transfer(vendorsInvoicesUsedLimit[vendor]);
            treasure -= vendorsInvoicesUsedLimit[vendor];
            vendorsInvoicesUsedLimit[vendor] = 0; //Reset used limit
        }
    }

    // For payVendor
    function payVendor(address _vendor) onlyOwner external{
        require(payLater==false, "This is available only for payLater feature");
        require(vendorsMaxLimit[_vendor] > 0, "Not a valid vendor.");

        //Pay the vendor
        address payable vendor = payable(_vendor);
        vendor.transfer(vendorsInvoicesUsedLimit[vendor]);
        vendorsInvoicesUsedLimit[vendor] = 0; //Reset used limit
        treasure -= vendorsInvoicesUsedLimit[vendor];
        
    }

    // When payLater is disabled
    function resetVendorUsedLimit(address _vendor) onlyOwner external returns (string memory){
        require(payLater==false, "Only for pay rigt away contract can reset the VendorUsedLimit");
        vendorsInvoicesUsedLimit[_vendor]=0;
        return "Vendor amount reset.";
    }

    //add a new vendor
    function addVendor(address _vendor, uint limitAmount) external returns (string memory)  {
        require(msg.sender == owner, "Ownable: You are not the owner.");
        require(limitAmount > 0, "You can not set a below 0 or 0 limit amount.");
        
        //add to vendor list
        vendorsMaxLimit[_vendor] = limitAmount;
        vendorsList.push(_vendor);

        return "Vendor added";
    }

    //eliminate a vendor
    function removeVendor(address _vendor, uint limitAmount) external returns (string memory)  {
        require(msg.sender == owner, "Ownable: You are not the owner.");
        require(vendorsMaxLimit[_vendor] > 0, "Not a valid vendor");
        if(payLater == true)
        {
            require(vendorsInvoicesUsedLimit[_vendor] == 0, "Vendor has not been paid yet so It can be removed");
        }

        vendorsMaxLimit[_vendor] = limitAmount;

        //Remove from vendor list
        bool found = false;
        for (uint i = 0; i < vendorsList.length; i++)
        {
            if(vendorsList[i] == _vendor)
            {
                found = true;
                vendorsMaxLimit[_vendor] = 0;
                vendorsInvoicesUsedLimit[_vendor] = 0;
                delete vendorsList[i];
                break;
            }
        }

        if(found == true)
        {
            return "Vendor removed";
        }
        else
        {
            return "Vendor could not be removed.";
        }
    }

    function getAllVendors() view external returns (address[] memory)
    {
        return vendorsList;
    }

    function getVendorAmountUsed() view external returns (uint)
    {
        uint amountInvoiced = 0;

         //Iterate and add used limit 
        for (uint i = 0; i < vendorsList.length; i++)
        {
            amountInvoiced = amountInvoiced + vendorsInvoicesUsedLimit[vendorsList[i]];
        }

        return amountInvoiced;
    }

    function getBudget() view external returns (uint)
    {
        return treasure;
    }

}