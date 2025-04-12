using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VideoChat.Shared
{
    public class SignalData
    {
        public string UserId { get; set; }
        public string Data { get; set; } // SDP or ICE candidate
        public string Type { get; set; } // "offer", "answer", "candidate"
    }
}
