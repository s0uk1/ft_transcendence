import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthWithWs } from 'src/chat/dto/user-ws-dto';
import { GameState } from './gameState';
import { GameService } from './game.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*'
  }
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  
  currentGames: Map<number, GameState> = new Map(); // key: gameId, value: GameState

  constructor(
		@Inject(forwardRef(() => GameService))
		private gameService: GameService,
    // private  gameService: GameService,
    // logger: Logger = new Logger('GameGateway')
  ) {}
  
    afterInit(server: Server) {
      console.log('GameGateway initialized');
    }
    
    @SubscribeMessage('queue')
    handleMessage(client: any, payload: any): string {
      client.emit('queue', 'Hello world!');
      return 'Hello world!';
    }

    @SubscribeMessage('updatePlayerPosition')
    updatePlayerPosition(client: any, payload: any): void {
      this.gameService.updatePlayerPosition(payload.userId, payload.position, payload.move);
    }
    

    // @SubscribeMessage('game')
    // handleMessage(client: any, payload:)
    
    async handleConnection(client: AuthWithWs) {
      const sockets = this.server.sockets;
      // const rooms = await this.gameService.getRooms();
    }
    
    handleDisconnect(client: AuthWithWs) {
      console.log(`Client disconnected: ${client.id}`);
    }
}
