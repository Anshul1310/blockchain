package com.example.myapplication

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.ConnectedGreen
import com.example.myapplication.ui.theme.DarkBackground
import com.example.myapplication.ui.theme.DarkCard
import com.example.myapplication.ui.theme.DarkSurface
import com.example.myapplication.ui.theme.DisconnectedRed
import com.example.myapplication.ui.theme.MetaMaskOrange
import com.example.myapplication.ui.theme.MetaMaskOrangeDark
import com.example.myapplication.ui.theme.MetaMaskOrangeLight
import com.example.myapplication.ui.theme.MyApplicationTheme
import com.example.myapplication.ui.theme.TextDimGray
import com.example.myapplication.ui.theme.TextGray
import com.example.myapplication.ui.theme.TextWhite
import io.metamask.androidsdk.DappMetadata
import io.metamask.androidsdk.Ethereum
import io.metamask.androidsdk.EthereumRequest
import io.metamask.androidsdk.EthereumState
import io.metamask.androidsdk.RequestError
import io.metamask.androidsdk.Result
import io.metamask.androidsdk.SDKOptions

class MainActivity : ComponentActivity() {

    // The MetaMask Ethereum SDK provider
    private lateinit var ethereum: Ethereum

    // Simple state variables — no ViewModel needed
    var walletAddress by mutableStateOf("")
    var isConnected by mutableStateOf(false)
    var isConnecting by mutableStateOf(false)
    var ethBalance by mutableStateOf("")
    var chainId by mutableStateOf("")
    var errorMessage by mutableStateOf("")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize the MetaMask Ethereum SDK with DappMetadata
        // DappMetadata takes: name, url, iconUrl (optional), base64Icon (optional)
        val dappMetadata = DappMetadata(
            "My Blockchain App",
            "https://myblockchainapp.example.com"
        )

        // SDKOptions allows specifying an Infura API key for read-only RPC requests
        // You can leave the infuraAPIKey as empty string if you don't have one
        val sdkOptions = SDKOptions(
            "",   // infuraAPIKey — leave empty if you don't have one
            null  // readonlyRPCMap — optional custom RPC endpoints
        )

        // Initialize Ethereum with context, dappMetadata, and sdkOptions
        ethereum = Ethereum(this, dappMetadata, sdkOptions)

        // Enable debug logging so we can see SDK events in Logcat
        ethereum.enableDebug = true

        setContent {
            MyApplicationTheme(darkTheme = true) {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    WalletScreenContent(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        // Handle the deep link return from MetaMask Mobile
        Log.d("MetaMask", "onNewIntent called with intent: $intent")
    }

    override fun onDestroy() {
        super.onDestroy()
        // Clean up the SDK connection when the activity is destroyed
        if (this::ethereum.isInitialized) {
            ethereum.disconnect()
        }
    }

    // -------------------------------------------------------
    // Connect to MetaMask wallet
    // -------------------------------------------------------
    fun connectWallet() {
        isConnecting = true
        errorMessage = ""

        Log.d("MetaMask", "Calling ethereum.connect()...")

        // Use the connect() convenience method which calls eth_requestAccounts internally
        ethereum.connect { result ->
            isConnecting = false
            Log.d("MetaMask", "connect() callback received: $result")

            if (result is Result.Success.Item) {
                // Result.Success.Item has a .value property of type String
                val accountsString = result.value
                Log.d("MetaMask", "Connected accounts: $accountsString")

                // Parse the first account address from the response
                val address = parseFirstAddress(accountsString)
                if (address.isNotEmpty()) {
                    walletAddress = address
                    isConnected = true
                    errorMessage = ""

                    // Fetch the chain ID after connecting
                    fetchChainId()
                    // Fetch the ETH balance after connecting
                    fetchBalance()
                } else {
                    errorMessage = "Could not parse wallet address from response."
                }
            } else if (result is Result.Success.Items) {
                // Result.Success.Items has a .value property of type List<String>
                val accountsList = result.value
                Log.d("MetaMask", "Connected accounts list: $accountsList")

                if (accountsList.isNotEmpty()) {
                    walletAddress = accountsList[0]
                    isConnected = true
                    errorMessage = ""

                    fetchChainId()
                    fetchBalance()
                } else {
                    errorMessage = "No accounts returned."
                }
            } else if (result is Result.Error) {
                val error: RequestError = result.error
                Log.e("MetaMask", "Connection error: ${error.message}")
                errorMessage = error.message
                isConnected = false
            }
        }
    }

    // -------------------------------------------------------
    // Disconnect from MetaMask wallet
    // -------------------------------------------------------
    fun disconnectWallet() {
        ethereum.disconnect()
        walletAddress = ""
        isConnected = false
        ethBalance = ""
        chainId = ""
        errorMessage = ""
    }

    // -------------------------------------------------------
    // Fetch the current chain ID
    // -------------------------------------------------------
    fun fetchChainId() {
        ethereum.getChainId { result ->
            if (result is Result.Success.Item) {
                chainId = result.value
                Log.d("MetaMask", "Chain ID: $chainId")
            } else if (result is Result.Error) {
                Log.e("MetaMask", "Chain ID error: ${result.error.message}")
            }
        }
    }

    // -------------------------------------------------------
    // Fetch the ETH balance for the connected wallet
    // -------------------------------------------------------
    fun fetchBalance() {
        if (walletAddress.isEmpty()) {
            return
        }

        // ethereum.getEthBalance takes: address, block tag, callback
        ethereum.getEthBalance(walletAddress, "latest") { result ->
            if (result is Result.Success.Item) {
                val hexBalance = result.value
                Log.d("MetaMask", "Balance (hex): $hexBalance")

                // Convert hex balance (in Wei) to ETH
                ethBalance = convertHexWeiToEth(hexBalance)
            } else if (result is Result.Error) {
                Log.e("MetaMask", "Balance error: ${result.error.message}")
                ethBalance = "Error"
            }
        }
    }

    // -------------------------------------------------------
    // Helper: parse the first address from the SDK response
    // The response is typically a JSON array like ["0xAbC..."]
    // or just a single address string
    // -------------------------------------------------------
    private fun parseFirstAddress(accountsString: String): String {
        // Remove brackets and quotes, then take the first address
        val cleaned = accountsString
            .replace("[", "")
            .replace("]", "")
            .replace("\"", "")
            .replace(" ", "")
        val parts = cleaned.split(",")
        if (parts.isNotEmpty() && parts[0].startsWith("0x")) {
            return parts[0]
        }
        // If it is already a clean address
        if (cleaned.startsWith("0x")) {
            return cleaned
        }
        return ""
    }

    // -------------------------------------------------------
    // Helper: convert a hex Wei string to ETH display string
    // -------------------------------------------------------
    private fun convertHexWeiToEth(hexValue: String): String {
        try {
            // Remove the "0x" prefix
            val hex = hexValue.removePrefix("0x")
            if (hex.isEmpty()) {
                return "0 ETH"
            }
            // Parse the hex value to a BigInteger
            val weiValue = java.math.BigInteger(hex, 16)
            // Convert Wei to ETH (1 ETH = 10^18 Wei)
            val divisor = java.math.BigDecimal("1000000000000000000")
            val ethValue = java.math.BigDecimal(weiValue).divide(
                divisor,
                6,
                java.math.RoundingMode.HALF_UP
            )
            return "$ethValue ETH"
        } catch (e: Exception) {
            Log.e("MetaMask", "Error converting balance: ${e.message}")
            return "0 ETH"
        }
    }

    // -------------------------------------------------------
    // Helper: shorten a wallet address for display
    // "0x1234567890abcdef..." becomes "0x1234...cdef"
    // -------------------------------------------------------
    private fun shortenAddress(address: String): String {
        if (address.length > 10) {
            val start = address.substring(0, 6)
            val end = address.substring(address.length - 4)
            return "$start...$end"
        }
        return address
    }

    // -------------------------------------------------------
    // Helper: get a readable network name from chain ID hex
    // -------------------------------------------------------
    private fun getNetworkName(chainIdHex: String): String {
        if (chainIdHex == "0x1") {
            return "Ethereum"
        } else if (chainIdHex == "0x5") {
            return "Goerli"
        } else if (chainIdHex == "0xaa36a7") {
            return "Sepolia"
        } else if (chainIdHex == "0x89") {
            return "Polygon"
        } else if (chainIdHex == "0x38") {
            return "BSC"
        } else if (chainIdHex == "0xa4b1") {
            return "Arbitrum"
        } else if (chainIdHex == "0xa") {
            return "Optimism"
        } else if (chainIdHex == "0xe708") {
            return "Linea"
        } else {
            return "Chain $chainIdHex"
        }
    }

    // =======================================================
    // COMPOSE UI
    // =======================================================

    @Composable
    fun WalletScreenContent(modifier: Modifier = Modifier) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            DarkBackground,
                            Color(0xFF0A0E14),
                            Color(0xFF0D1117)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // App title area
                Text(
                    text = "\uD83E\uDD8A",
                    fontSize = 64.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "MetaMask Wallet",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextWhite,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Connect your wallet to get started",
                    fontSize = 14.sp,
                    color = TextGray,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(40.dp))

                // Show different UI based on connection state
                if (isConnected) {
                    // ------ CONNECTED STATE ------
                    ConnectedCard()
                } else {
                    // ------ DISCONNECTED STATE ------
                    DisconnectedCard()
                }

                // Error message display
                if (errorMessage.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = DisconnectedRed.copy(alpha = 0.15f)
                        )
                    ) {
                        Text(
                            text = errorMessage,
                            color = DisconnectedRed,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(16.dp),
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }

    @Composable
    fun DisconnectedCard() {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = DarkCard.copy(alpha = 0.7f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Status indicator
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(DisconnectedRed)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Not Connected",
                        color = TextGray,
                        fontSize = 13.sp
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Connect your MetaMask wallet to interact with the blockchain",
                    color = TextGray,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Connect button
                Button(
                    onClick = { connectWallet() },
                    enabled = !isConnecting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MetaMaskOrange,
                        contentColor = Color.White,
                        disabledContainerColor = MetaMaskOrange.copy(alpha = 0.5f),
                        disabledContentColor = Color.White.copy(alpha = 0.7f)
                    )
                ) {
                    if (isConnecting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Connecting...",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    } else {
                        Text(
                            text = "\uD83E\uDD8A  Connect MetaMask",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }

    @Composable
    fun ConnectedCard() {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = DarkCard.copy(alpha = 0.7f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Status indicator — Connected
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(ConnectedGreen)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Connected",
                        color = ConnectedGreen,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Wallet Address
                Text(
                    text = "Wallet Address",
                    color = TextGray,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = shortenAddress(walletAddress),
                    color = TextWhite,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Full address in smaller text
                Text(
                    text = walletAddress,
                    color = TextDimGray,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Balance and Chain info in a row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    // Balance column
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Balance",
                            color = TextGray,
                            fontSize = 12.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        if (ethBalance.isNotEmpty()) {
                            Text(
                                text = ethBalance,
                                color = MetaMaskOrangeLight,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        } else {
                            Text(
                                text = "Loading...",
                                color = MetaMaskOrangeLight,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // Chain ID column
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Network",
                            color = TextGray,
                            fontSize = 12.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        if (chainId.isNotEmpty()) {
                            Text(
                                text = getNetworkName(chainId),
                                color = TextWhite,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        } else {
                            Text(
                                text = "Loading...",
                                color = TextWhite,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Refresh balance button
                OutlinedButton(
                    onClick = { fetchBalance() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = MetaMaskOrange.copy(alpha = 0.5f)
                    )
                ) {
                    Text(
                        text = "Refresh Balance",
                        color = MetaMaskOrange,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Disconnect button
                Button(
                    onClick = { disconnectWallet() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DisconnectedRed.copy(alpha = 0.15f),
                        contentColor = DisconnectedRed
                    )
                ) {
                    Text(
                        text = "Disconnect Wallet",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}