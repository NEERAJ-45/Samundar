'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading CN roadmap topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const USER_NAME = 'NEERAJ';
const STORAGE_PREFIX = 'foundation-cn';

const cnQuestions: QuestionItem[] = [
  { id: 201, title: 'What is a Computer Network? Explain LAN, MAN, and WAN.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/types-of-area-networks-lan-man-and-wan/' },
  { id: 202, title: 'Explain the OSI Reference Model and list its seven layers.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/osi-model-full-form-in-computer-networking/' },
  { id: 203, title: 'Explain the TCP/IP Reference Model and compare it with the OSI Model.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/tcp-ip-model/' },
  { id: 204, title: 'What is the difference between a Hub, Switch, and Router?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/difference-between-hub-switch-and-router/' },
  { id: 205, title: 'What is MAC addressing and how does it differ from IP addressing?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/introduction-of-mac-address-in-computer-network/' },
  { id: 206, title: 'What are transmission modes? Explain Simplex, Half-Duplex, and Full-Duplex.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/transmission-modes-in-computer-networks/' },
  { id: 207, title: 'What is framing in the Data Link Layer? List the methods.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/framing-in-data-link-layer/' },
  { id: 208, title: 'Explain Flow Control techniques (Stop and Wait, Sliding Window protocols).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/stop-and-wait-arq/' },
  { id: 209, title: 'Explain Go-Back-N (GBN) and Selective Repeat (SR) protocols.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/sliding-window-protocol-set-2-receiver-side/' },
  { id: 210, title: 'What are the main error detection and correction techniques (Parity, checksum, CRC, Hamming code)?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/error-detection-in-computer-networks/' },
  { id: 211, title: 'Explain the working of CSMA/CD used in Ethernet.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/carrier-sense-multiple-access-csma/' },
  { id: 212, title: 'Explain the working of CSMA/CA used in Wireless Networks.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/collision-avoidance-in-wireless-networks/' },
  { id: 213, title: 'What are IPv4 addresses and what are Classful vs Classless (CIDR) addressing?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/introduction-of-classful-ip-addressing/' },
  { id: 214, title: 'Explain Subnetting and how to calculate subnet masks.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/introduction-to-subnetting/' },
  { id: 215, title: 'What is the ARP (Address Resolution Protocol) and how does it work?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/arp-reverse-arprapr-inverse-arpinarp-and-proxy-arp/' },
  { id: 216, title: 'Explain ICMP (Internet Control Message Protocol) and its use in ping/traceroute.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/internet-control-message-protocol-icmp/' },
  { id: 217, title: 'What is DHCP (Dynamic Host Configuration Protocol) and explain the DORA process.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/dynamic-host-configuration-protocol-dhcp/' },
  { id: 218, title: 'What is NAT (Network Address Translation) and why is it used (SNAT vs DNAT vs PAT)?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/network-address-translation-nat/' },
  { id: 219, title: 'Explain the difference between Link State (OSPF) and Distance Vector (RIP) routing algorithms.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/difference-between-distance-vector-routing-and-link-state-routing/' },
  { id: 220, title: 'What is BGP (Border Gateway Protocol) and when is it used?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/border-gateway-protocol-bgp/' },
  { id: 221, title: 'What is IPv6 and what are its key features compared to IPv4?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/internet-protocol-version-6-ipv6/' },
  { id: 222, title: 'Explain the difference between TCP and UDP protocols.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/differences-between-tcp-and-udp/' },
  { id: 223, title: 'Explain the TCP Three-Way Handshake connection establishment process.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/tcp-3-way-handshake-process/' },
  { id: 224, title: 'Explain the TCP Connection Termination process (Four-Way Handshake).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/tcp-connection-termination/' },
  { id: 225, title: 'What is Flow Control in TCP? Explain the sliding window mechanism.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/tcp-flow-control/' },
  { id: 226, title: 'Explain TCP Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit, Fast Recovery).', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/tcp-congestion-control/' },
  { id: 227, title: 'What are TCP flags (SYN, ACK, FIN, RST, PSH, URG) and their functions?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/tcp-flags/' },
  { id: 228, title: 'What is the DNS (Domain Name System) and explain iterative vs recursive query resolution.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/domain-name-system-dns-in-application-layer/' },
  { id: 229, title: 'Explain HTTP vs HTTPS protocols in detail.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/html/explain-working-of-https/' },
  { id: 230, title: 'Explain HTTP Request methods (GET, POST, PUT, DELETE, PATCH, OPTIONS).', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/http-request-methods/' },
  { id: 231, title: 'Explain HTTP Status Codes (1xx, 2xx, 3xx, 4xx, 5xx) and common examples.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/http-status-codes/' },
  { id: 232, title: 'What are cookies and sessions? How do they enable statefulness over stateless HTTP?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/http-cookies/' },
  { id: 233, title: 'What is HTTP/2 and HTTP/3 (QUIC) and what improvements do they offer over HTTP/1.1?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/http-1-1-vs-http-2-what-is-the-difference/' },
  { id: 234, title: 'Explain the working of SMTP, POP3, and IMAP protocols for email.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/simple-mail-transfer-protocol-smtp/' },
  { id: 235, title: 'What is FTP and SFTP, and how do they differ?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/file-transfer-protocol-ftp-in-application-layer/' },
  { id: 236, title: 'What is Socket Programming? Explain TCP sockets vs UDP sockets.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/socket-programming-cc/' },
  { id: 237, title: 'What is cryptography? Explain Symmetric vs Asymmetric encryption.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/difference-between-symmetric-and-asymmetric-key-encryption/' },
  { id: 238, title: 'Explain the working of SSL/TLS handshake for securing connections.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/computer-networks/secure-socket-layer-ssl/' },
  { id: 239, title: 'What are Digital Signatures and Digital Certificates? What is a CA (Certificate Authority)?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/digital-signatures-certificates/' },
  { id: 240, title: 'What is a Firewall and what are Packet Filtering vs Stateful Inspection Firewalls?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/introduction-of-firewall-in-computer-network/' },
  { id: 241, title: 'What is a VPN (Virtual Private Network) and how does it work?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/virtual-private-network-vpn-introduction/' },
  { id: 242, title: 'Explain DDoS (Distributed Denial of Service) attacks and prevention strategies.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/deniel-service-prevention/' },
  { id: 243, title: 'What is IP spoofing and ARP poisoning/spoofing?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/what-is-ip-spoofing/' },
  { id: 244, title: 'Explain how Traceroute commands discover routers along a path.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/traceroute-command-in-linux-with-examples/' },
  { id: 245, title: 'What is transmission delay, propagation delay, queuing delay, and processing delay?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/types-of-delays-in-computer-network/' },
  { id: 246, title: 'What is a Proxy Server? Explain Forward Proxy vs Reverse Proxy.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/what-is-proxy-server/' },
  { id: 247, title: 'What are network topologies? Explain Star, Mesh, Ring, and Bus topologies.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/types-of-network-topology/' },
  { id: 248, title: 'What is Wi-Fi? Explain WPA2 and WPA3 security standards.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/computer-networks/introduction-of-wireless-security/' },
  { id: 249, title: 'What is Port Forwarding and how is it used?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/what-is-port-forwarding/' },
  { id: 250, title: 'What is Multiplexing? Explain FDM, TDM, and WDM in physical layer.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/computer-networks/multiplexing-frequency-division-and-time-division/' }
];

export default function CNQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/foundation"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Foundation Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Computer Networks roadmap</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Foundational and advanced topics in OSI layers, TCP/IP protocol suite, routing, and DNS.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={cnQuestions}
          storagePrefix="foundation-cn"
          searchPlaceholder="Search CN topics..."
        />
      </div>
    </div>
  );
}
