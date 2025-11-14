/**
 * @deprecated This hook is deprecated
 * Use useSocket from "context/SocketContext" instead
 * SocketContext provides centralized socket management with proper cleanup
 */

import { useSocket as useSocketContext } from "../context/SocketContext";

export const useSocket = useSocketContext;

