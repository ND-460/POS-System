import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, message, Table } from "antd";

const CustomerPastOrders = () => {
  const [items, setItems] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    loadItemsWithBills();
    //  loadBills();
  });
  // const loadBills = async() => {
  //     try{
  //         const{data} = await axios.get("http://localhost:8080/api/:users/:bills");
  //         setBills(data);
  //     }catch(error){
  //         console.log(error);
  //     }
  // }
  const loadItemsWithBills = async (values) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/api/:users/${values}/:items`);
      setItems(data);
    } catch (error) {
      console.log(error + "is occured");
    }
  };
  const viewBillOrder = async (values) => {
    try {
      if (setBills) {
        console.log(`viewing the bills:${setBills}`);
        await loadItemsWithBills(setBills);
      }
    } catch (error) {
      console.log("cannot see the bill order");
      message.error("cannot see the bill order");
    }
  };
  return (
    <>
      <Table
        dataSource={bills}
        columns={[
          { title: "OrderId", dataIndex: "_id" },
          {title:"Time", dataIndex:"timestamp"},
          {title:"Handled by",dataIndex:"cashier"},
        //   {title:"item name"}
        //   {title:"Quantity", dataIndex:"items.quantity"},
          {
            title: "Action",
            render: (_, record) => (
              <>
                <Button onClick={viewBillOrder(record)}>View Order</Button>
              </>
            ),
          },
        ]}
      />
    </>
  );
};
export default CustomerPastOrders;