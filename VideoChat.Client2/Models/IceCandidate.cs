namespace VideoChatClient2.Models
{
    public class IceCandidate
    {
        public string candidate { get; set; }
        public string sdpMid { get; set; }
        public int sdpMLineIndex { get; set; }
    }
}
