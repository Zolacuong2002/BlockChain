import React, { useState, useEffect } from 'react'
import { useRouter} from "next/router"

// INTERNAL IMPORT
import { CheckIfWalletConnected, 
        ConnectWallet, 
        connectingWithContract, 
} from "../Utils/apiFeature"

export const ChatAppContext = React.createContext();

export const ChatAppProvider = ({children}) => {
    // USESTATE
    const [account, setAccount] = useState("");
    const [userName, setUserName] = useState("");
    const [friendLists, setFriendLists] = useState([]);
    const [friendMsg, setFriendMsg] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLists, setUserLists] = useState([]);
    const [error, setError] = useState("");

    // CHAT USER DATA
    const [currentUserName, setCurrentUserName] = useState("");
    const [currentUserAddress, setCurrentUserAddress] = useState("");

    const router = useRouter();

    // FETCH DATA TIME OF PAGE LOAD 
    const fetchData = async () => {
        try {
            // GET CONTRACT
            const contract = await connectingWithContract();
            // GET ACCOUNT
            const connectAccount = await ConnectWallet();
            setAccount(connectAccount);
            // GET USER NAME
            const userName = await contract.getUserName(connectAccount);
            setUserName(userName);
            // GET MY FRIEND LIST
            const friendLists = await contract.getMyFriendList()
            setFriendLists(friendLists);
            // GET ALL APP USER
            const userList = await contract.getAllAppUser();
            setUserLists(userList);
        } catch (error) {
            // setError("Please Install And Connect Your Wallet");
            console.log(error)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // READ MESSAGE
    const readMessage = async(friendAddress) =>{
        try {
            const contract = await connectingWithContract();
            const read = await contract.readMessage(friendAddress);
            setFriendMsg(read);
        } catch (error) {
            setError("Currently You have no message");
        }
    };

    // CREATE ACCOUNT createAccount
    const createAccount = async ({ name, accountAddress }) => {
        try {
            console.log(name)
            // if (name || accountAddress)
            //     return setError("Name And AccountAddress cannot be empty");
            const contract = await connectingWithContract();
            const getCreatedUser = await contract.createAccount(name);
            setLoading(true);
            await getCreatedUser.wait();
            setLoading(false);
            window.location.reload();
        } catch (error) {
            console.log(error)
            setError("Error while creating your account Please reload browser");
        }
    };

    // ADD YOUR FRIENDS
    const addFriends = async ({ name, accountAddress }) =>{
        try {
            // if(name || accountAddress) return setError("Please provide data");
            
            const contract = await connectingWithContract();
            const addMyFriend = await contract.addFriend(accountAddress, name)
            setLoading(true);
            await addMyFriend.wait();
            setLoading(false);
            router.push("/");
            window.location.reload();
            
        } catch (error) {
            setError("Something went wrong while adding friends, try again.");
        }
    };

    // SEND MESSAGE
    const sendMessage = async ({msg, address}) => {
        console.log(msg)
        console.log(address)
        try {
            // if(msg || address) return setError("Please type your message");

            const contract = await connectingWithContract();
            const addMessage = await contract.sendMessage(address, msg)
            setLoading(true);
            await addMessage.wait();
            setLoading(false);
            window.location.reload();
        } catch (error) {
            console.log(error)
            setError("Please reload and try again");
        }
    };

    // READ INFO
    const readUser = async (userAddress) => {
        const contract = await connectingWithContract();
        const userName = await contract.getUserName(userAddress);
        setCurrentUserName(userName);
        setCurrentUserAddress(userAddress);
    };
    return (
       
        <ChatAppContext.Provider value={{ 
            readMessage, createAccount, addFriends, 
            sendMessage, readUser, account, 
            userName, friendLists, friendMsg, 
            loading, userLists, error,
            CheckIfWalletConnected, ConnectWallet,
            currentUserName, currentUserAddress
            }}
        >
            {children}
        </ChatAppContext.Provider>
    );
}