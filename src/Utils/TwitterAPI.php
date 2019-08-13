<?php


namespace App\Utils;
use Symfony\Component\HttpClient\HttpClient;

class TwitterAPI
{
    private $APIKEY;
    private $APISECRET;
    private $ACCESSTOKEN;
    private $ACCESSTOKENSECRET;

    function __construct($keys) {
        $this->APIKEY = $keys["APIKEY"];
        $this->APISECRET = $keys["APISECRET"];
        $this->ACCESSTOKEN = $keys["ACCESSTOKEN"];
        $this->ACCESSTOKENSECRET = $keys["ACCESSTOKENSECRET"];
    }

    function OpenConnection() {
        $authURL = 'https://api.twitter.com/oauth2/token';
        $httpClient = HttpClient::create();

        $response = $httpClient->request('POST', $authURL, [
            'headers' => [
                'Host' => 'api.twitter.com',
                'User-Agent' => 'RileySymfonyProject',
                'Authorization' => 'Basic bEIxYXZwSEsxb0U0TVlDSHlaN0pUZDNMUzprMGF4V3piZjdtSGhVdmZrclNIbWE5djBaaGpCZlRTbGxKN2N4VkxWNDh2NWtjdlRpZQ==',
                'Content-Type' => 'application/x-www-form-urlencoded;charset=UTF-8',
                'Accept-Encoding' => 'gzip'
            ],
            'body' => 'grant_type=client_credentials'
        ]);
        if ($response->getStatusCode() == 200) {
            $decompress = gzdecode($response->getContent());
            $decode = json_decode($decompress, true);
            $_SESSION['bearer'] = $decode['access_token'];

            return $_SESSION['bearer'];
        } else {
            echo ($response->getContent(FALSE));
        }
    }

    function SearchUser($user) {

        $searchURL = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=10&screen_name='.$user;
        $httpClient = HttpClient::create();

        $auth = 'Bearer '. $_SESSION['bearer'];
        $response = $httpClient->request('GET', $searchURL, [
            'headers' => [
                'Host' => 'api.twitter.com',
                'User-Agent' => 'RileySymfonyProject',
                'Authorization' => $auth,
                'Accept-Encoding' => 'gzip'
            ]
        ]);
        $decompress = gzdecode($response->getContent());
        $decode = json_decode($decompress, true);
        return $decode;
    }

    function StreamTakeThree($search) {
        ob_implicit_flush(true);
        ini_set('max_execution_time', 30);
        $urlFull = 'https://stream.twitter.com/1.1/statuses/filter.json';
        $streamURL = 'stream.twitter.com';
        $path = '/1.1/statuses/filter.json';
        $auth = $this->AuthorizationBuilder($urlFull, $search);

        //$fp = fsockopen('ssl://'.$streamURL, 443, $errno, $errstr, 15);
        $fp = stream_socket_client('ssl://'.$streamURL.':443', $errno, $errstr, 15, STREAM_CLIENT_CONNECT);

        $request  = "POST /1.1/statuses/filter.json?track=". urlencode($search) ." HTTP/1.1\r\n";
        //$request  = "POST /1.1/statuses/filter.json?" . urlencode("track") . "=" . urlencode("cookie") . " HTTP/1.1\r\n";
        $request .= "Accept: */*\r\n";
        $request .= "Connection: Open\r\n";
        $request .= "User-Agent: RileySymfonyProject\r\n";
        $request .= "Content-Type: application/x-www-form-urlencoded\r\n";
        $request .= "Authorization: " . $auth . "\r\n";
        $request .= "Host: stream.twitter.com\r\n\r\n";
        //$request .= 'track=cookie';

        register_shutdown_function([$this, 'Timeout']);
        fputs($fp, $request);
        stream_set_blocking($fp, 0);

        do {
            $result  = stream_get_line($fp, 1048576, "\r\n\r\n");
        } while(!$result);
        $headers = explode("\r\n", $result);

        $data            = '';
        $last_message    = time();
        $message_length  = 0;

        while (!feof($fp)) {

            $chunk = '';
            $chunk_length = fgets($fp, 10);
            if (!empty($chunk_length)){
                echo("\r\n");
            }
            flush();
            if ($chunk_length === '' || !$chunk_length = hexdec($chunk_length)) {
                continue;
            }
            do {
                $chunk .= fread($fp, $chunk_length);
                $chunk_length -= strlen($chunk);
            } while($chunk_length > 0);
            if ($chunk_length === 0) {
                echo($chunk);
            }
            flush();

            $data           = '';
            $message_length = 0;
            $last_message   = time();
        }
        fclose($fp);
    }

    //WORKS
    function StreamTakeTwo() {
        $streamURL = 'https://stream.twitter.com/1.1/statuses/filter.json';
        $auth = $this->AuthorizationBuilder($streamURL);
        ob_start();
        $headers = [
            'Accept: */*',
            'Connection: Open',
            'User-Agent: RileySymfonyProject',
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: '. $auth,
            'Host: stream.twitter.com'
        ];
        $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $streamURL);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "track=cookie");
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            curl_setopt($ch, CURLOPT_CAINFO,  'C:\Users\ridid44\.symfony\certs\cacert.crt');
            curl_setopt($ch,CURLOPT_CAPATH, 'C:\Users\ridid44\.symfony\certs\cacert.crt');
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLINFO_HEADER_OUT, true);
            curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($curl, $data){
                echo $data;
                flush();
                return strlen($data);
            });
            curl_exec($ch);
            curl_close($ch);
    }

    //WORKS
    function StreamTweets() {
        $streamURL = 'https://stream.twitter.com/1.1/statuses/filter.json';
        $auth = $this->AuthorizationBuilder($streamURL);
        $httpClient = HttpClient::create(['http_version' => '1.1']);
        $response = $httpClient->request('POST', 'https://stream.twitter.com/1.1/statuses/filter.json?track=cookie', [
            'headers' => [
                'Accept' => '*/*',
                'Connection' => 'Keep-Alive',
                'User-Agent' => 'RileySymfonyProject',
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Authorization' => $auth,
                'Content-Length' => 0,
                'Host' => 'stream.twitter.com'
            ],
        ]);

       //var_dump($response->getContent(false));
        foreach ($httpClient->stream($response) as $chunk) {
            echo($chunk->getContent());
        }

    }

    function CallbackTest($curl, $data){
        ob_get_clean();
        var_dump($data);
        //ob_flush();
        flush();
    }

    function AuthorizationBuilder($url, $search) {
        $nonce = 'kYjzVBb8Y0ZF7bxSWbWFvY3uQSQ2pTgmZeNu2VS4cg';
        $timestamp = time();

        $param_string = 'oauth_consumer_key='.$this->APIKEY.
            '&oauth_nonce='.$nonce.
            '&oauth_signature_method=HMAC-SHA1'.
            '&oauth_timestamp='.$timestamp.
            '&oauth_token='.$this->ACCESSTOKEN.
            '&oauth_version=1.0'.
            '&track='.rawurlencode($search);

        $base_string = 'POST&' . rawurlencode($url). '&' .rawurlencode($param_string);
        $signing_key = rawurlencode($this->APISECRET).'&'.rawurlencode($this->ACCESSTOKENSECRET);
        $signature = base64_encode(hash_hmac('sha1', $base_string, $signing_key, true));

        $auth = 'OAuth oauth_consumer_key="' . rawurlencode($this->APIKEY) . '", ' .
            'oauth_nonce="' . rawurlencode($nonce) . '", ' .
            'oauth_signature="' . rawurlencode($signature) . '", ' .
            'oauth_signature_method="HMAC-SHA1", ' .
            'oauth_timestamp="' . rawurlencode($timestamp) . '", ' .
            'oauth_token="' . rawurlencode($this->ACCESSTOKEN) . '", ' .
            'oauth_version="1.0"';

        return $auth;
    }

    function Timeout() {
        echo 'Script executed with success', PHP_EOL;
    }
}