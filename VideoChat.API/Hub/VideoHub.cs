using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace VideoChat.API
{
    public class VideoHub : Hub
    {
        private readonly Dictionary<string, List<string>> _rooms = new();

        public async Task JoinRoom(string roomId, string userId)
        {
            if (!_rooms.ContainsKey(roomId))
            {
                _rooms[roomId] = new List<string>();
            }
            _rooms[roomId].Add(Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            //await Clients.Group(roomId).SendAsync("UserJoined", userId);
            await Clients.Group(roomId).SendAsync("UserJoined", userId, Context.ConnectionId);
        }

        public async Task SendSignal(string roomId, string userId, string signalData)
        {
            //await Clients.GroupExcept(roomId, Context.ConnectionId).SendAsync("ReceiveSignal", userId, signalData);

            await Clients.Group(roomId).SendAsync("ReceiveSignal", Context.ConnectionId, userId, signalData);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (var room in _rooms)
            {
                if (room.Value.Contains(Context.ConnectionId))
                {
                    room.Value.Remove(Context.ConnectionId);
                    await Clients.Group(room.Key).SendAsync("UserLeft", Context.ConnectionId);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
