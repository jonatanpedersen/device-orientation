using Microsoft.AspNet.SignalR;

namespace DeviceOrientation.Hubs
{
    public class DeviceOrientationEvent
    {
        public int Alpha { get; set; }
        public int Beta { get; set; }
        public int Gamma { get; set; }
    }

    public class DeviceOrientationHub : Hub
    {
        public void OnDeviceOrientation(string deviceId, float alpha, float beta, float gamma)
        {
            Clients.Group(deviceId).onDeviceOrientation(alpha, beta, gamma);
        }

        public void Subscribe(string deviceId)
        {
            Groups.Add(Context.ConnectionId, deviceId);
        }

        public void Unsubscribe(string deviceId)
        {
            Groups.Remove(Context.ConnectionId, deviceId);
        }
    }
}