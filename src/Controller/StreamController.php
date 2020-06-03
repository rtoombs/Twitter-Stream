<?php

namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Utils\TwitterAPI;

class StreamController extends AbstractController {

    public $connection;
    public function __construct() {
        $Keys = file_get_contents(__DIR__."\KEYS.json");
        $array = json_decode($Keys, true);
        //var_dump(session_status());
        if (session_status() == PHP_SESSION_NONE) {
            $_SESSION['stream'] = FALSE;
            session_start();
        }
        $this->connection = new TwitterAPI($array);
    }

    public function RenderPage() {
        return $this->render('stream.html.twig');
    }

    public function Start() {
        $this->connection = new TwitterAPI();
        $status = $this->connection->OpenConnection();
        return new Response($status);
    }

    public function SearchUser() {
        $user = $_POST['user'];
        if (!empty($this->connection)) {
            $data = $this->connection->SearchUser($user);
            return new Response(json_encode($data));
        }
        return new Response('boom');
    }

    public function TwitterStream() {
        $data = $_POST['data'];

        if ($_SESSION['stream'] == FALSE) {
            $_SESSION['stream'] = TRUE;
            $this->connection->StreamTakeThree($data);
        } else {
            return new Response('[SIP]');
        }
        return new Response('Good');
    }

    public function ClearSession() {
        $_SESSION['stream'] = FALSE;
        return new Response('Stream Cleared');
    }

}
