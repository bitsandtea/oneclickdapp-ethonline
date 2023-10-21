// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract OneClickTable is Ownable, IERC721Receiver{
  uint256 public tableId; //created beforehand
  string private constant _TABLE_PREFIX = "oneclick";
  ITablelandTables tableland = TablelandDeployments.get();

  // Add a constructor that creates and inserts data
  // constructor(address _initialOwner, uint256 _tableId) Ownable(_initialOwner)  {
    constructor(address _initialOwner) Ownable(_initialOwner)  {
    // tableId = _tableId;
    tableId = tableland.create(
        address(this),
        SQLHelpers.toCreateFromSchema(
            "projectID text, userID text, name text, contractAddress text, chainID text, ABI text", _TABLE_PREFIX
        )
    );
  }

   // Let anyone insert into the table
   
      
      
      
    function insertIntoTable(
      string memory _projectID, 
      string memory _name, 
      string memory _contractAddress,
      string memory _chainID,
      string memory _ABI
    ) external {
        tableland.mutate(
            address(this), 
            tableId,
            SQLHelpers.toInsert(
                _TABLE_PREFIX,
                tableId,
                "projectID, userID, name, contractAddress, chainID, ABI",
                string.concat(
                  SQLHelpers.quote(_projectID),
                  ",",
                  SQLHelpers.quote(Strings.toHexString(msg.sender)), // Insert the caller's address
                  ",",
                  SQLHelpers.quote(_name),
                  ",",
                  SQLHelpers.quote(_contractAddress), 
                  ",",
                  SQLHelpers.quote(_chainID),
                  ",",
                  SQLHelpers.quote(_ABI)
                )
            )
        );
    }

    // Update only the row that the caller inserted
    function updateTable(
      string memory _name, 
      string memory _chainID,
      string memory _ABI
      ) external {
        string memory setters = 
        string.concat(
            "name=", SQLHelpers.quote(_name), ",", 
            "chainID=", SQLHelpers.quote(_chainID), ",", 
            "ABI=", SQLHelpers.quote(_ABI));
        string memory filters = string.concat("userID=", SQLHelpers.quote(Strings.toHexString(msg.sender)));
        tableland.mutate(
            address(this),
            tableId,
            SQLHelpers.toUpdate(_TABLE_PREFIX, tableId, setters, filters)
        );
    }

    // set tableID;
    function setTableId(uint256 _tableId) external onlyOwner {
      tableId = _tableId;
    }

    // Set the ACL controller to enable row-level writes with dynamic policies
    function setAccessControl(address controller) external onlyOwner {
      tableland.setController(
          address(this), // Table owner, i.e., this contract
          tableId,
          controller // Set the controller address—a separate controller contract
      );
    }

    // Needed for the contract to own a table
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

}