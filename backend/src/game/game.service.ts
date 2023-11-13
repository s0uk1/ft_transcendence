import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameDto } from './dto/create.dto';
// import { Game, Status } from '@prisma/client';
import { INQUIRER } from '@nestjs/core';
import { GameGateway } from './game.gateway';
import { GameState } from './gameState';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from '@prisma/client';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class GameService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly gameGateway: GameGateway,
		private readonly notificationService: NotificationService,
		private readonly notificationGateway: NotificationGateway,
	) {}


	async getGames() {
		const games = await this.prisma.game.findMany({
			include: {
				players: {
					include: {
						user: true,
					},
				},
			},
		});
		if (!games)
			throw new HttpException(`No games found`, HttpStatus.BAD_REQUEST);
		return games;
	}

	async getGameById(id: number) {
		const game = await this.prisma.game.findUnique({
			where: {
				id: id,
			},
			include: {
				players: {
					include: {
						user: true,
					},
				},
			},
		});
		if (!game)
			throw new HttpException(`No game found`, HttpStatus.BAD_REQUEST);
		return game;
	}

	async invitePlayer(data: {userId: number}, user: any) {
		const opponent = await this.prisma.user.findFirst({
			where: {
				id: data.userId,
				status: {
				 in: ["ONLINE", "INQUEUE"]
			 	}
			}
		});
		if (!opponent)
			throw new HttpException(`No user with id ${data.userId} is available`, HttpStatus.BAD_REQUEST);
		this.notificationGateway.sendNotificationToUser(
			String(opponent.id),
			{
				senderId: user.id,
				receiverId: opponent.id,
				type: NotificationType.GAME_INVITE,
			}
		);
	}

	async acceptInvite(data: {userId: number}, user: any) {
		const updatedUser = await this.prisma.user.updateMany({
			where: {
				id: {
					in: [user.id, data.userId],
				},
			},
			data: {
				status: "INGAME"
			}
		});

		const game = await this.prisma.game.create({
			data: {
				mode: 'VSONE',
				players: {
					connect: [
						{ id: data.userId },
						{ id: user.id }
					]
				}
			}
		});

		const player = await this.prisma.player.create({
			data: {
				status: 'LOSER',
				game: {
					connect: {
						id: game.id,
					},
				},
				user: {
					connect: {
						id: data.userId,
					},
				},
			},
		});
		if (!player)
			throw new HttpException(`Error creating player`, HttpStatus.BAD_REQUEST);
	
		const opponentPlayer = await this.prisma.player.create({
			data: {
				status: 'LOSER',
				game: {
					connect: {
						id: game.id,
					},
				},
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		});
		if (!opponentPlayer)
			throw new HttpException(`Error creating opponent player`, HttpStatus.BAD_REQUEST);

		this.gameGateway.server.to(String(player.userId)).emit('gameStart', "start the fucking game");
		this.gameGateway.server.to(String(opponentPlayer.userId)).emit('gameStart', "start the game");

		const gameState = new GameState(
			{id: player.userId, paddlePosition: 5, score: 0},
			{id: player.userId, paddlePosition: 5, score: 0},
			{x: 0, y: 0},
			{x: 0, y: 0},
		)
		this.gameGateway.currentGames[game.id] = gameState
		this.gameGateway.server.to(String(player.userId)).emit('gameUpdate', gameState);
		this.gameGateway.server.to(String(opponentPlayer.userId)).emit('gameUpdate', gameState);

		//send response to start the game
		// return game;
	}

	async declineInvite(data: {userId: number}, user: any) {
		const opponent = await this.prisma.user.findFirst({
			where: {
				id: data.userId,
				status: {
				 in: ["ONLINE", "INQUEUE"]
			 	}
			}
		});
		if (!opponent)
			throw new HttpException(`No user with id ${data.userId} is available`, HttpStatus.BAD_REQUEST);

		this.notificationService.create({
			senderId: data.userId,
			receiverId:	user.id,
			type: NotificationType.GAME_INVITE_REJECTED,
		})
		// this.gameGateway.server.to(String(opponent.id)).emit('gameNotification', `rejectak ${user.profile.username}`);
		//send response to start the game
	}

	// async finishGame()

	async findGame(user: any) {
		const opponent = await this.prisma.user.findFirst({
			where: {
				id: {
					not: user.id,
				},
				status: "INQUEUE"
			}
		});
		if (!opponent) {
			console.log("no opponent found");
			await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					status: "INQUEUE"
				}
			});
			return;
		}
		
		await this.prisma.user.updateMany({
			where: {
				id: {
					in: [user.id, opponent.id],
				},
			},
			data: {
				status: "INGAME"
			}
		});
		console.log("opponent found");
	
		const game = await this.prisma.game.create({
			data: {
				mode: 'VSONE',
				players: {
					connect: [
						{ id: user.id },
						{ id: opponent.id }
					]
				}
			}
		});
		if (!game)
			throw new HttpException(`Error creating game`, HttpStatus.BAD_REQUEST);

		console.log("game created");

		const player = await this.prisma.player.create({
			data: {
				status: 'LOSER',
				game: {
					connect: {
						id: game.id,
					},
				},
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		});
		if (!player)
			throw new HttpException(`Error creating player 1`, HttpStatus.BAD_REQUEST);

		const opponentPlayer = await this.prisma.player.create({
			data: {
				status: 'LOSER',
				game: {
					connect: {
						id: game.id,
					},
				},
				user: {
					connect: {
						id: opponent.id,
					},
				},
			},
		});
		if (!opponentPlayer)
			throw new HttpException(`Error creating player 2`, HttpStatus.BAD_REQUEST);


		this.gameGateway.server.to(String(player.userId)).emit('queue', game);

		const gameState = new GameState(
			{id: player.userId, paddlePosition: 5, score: 0},
			{id: player.userId, paddlePosition: 5, score: 0},
			{x: 0, y: 0},
			{x: 0, y: 0},
		)
		this.gameGateway.currentGames[game.id] = gameState
		this.gameGateway.server.to(String(player.userId)).emit('gameUpdate', gameState);
		this.gameGateway.server.to(String(opponentPlayer.userId)).emit('gameUpdate', gameState);
	}


	async updatePlayerPosition(userId: number, direction: "up" | "down") {
		const player = await this.prisma.player.findFirst({
			where: {
				userId: userId,
			},
		});
		if (!player)
			throw new HttpException(`No player found`, HttpStatus.BAD_REQUEST);
		const rightPlayer = this.gameGateway.currentGames[player.gameId].player1 
			? this.gameGateway.currentGames[player.gameId].player1 == userId 
			: this.gameGateway.currentGames[player.gameId].player2;
		let currentPlayerPosition = await rightPlayer.paddlePosition;
		if (direction === "up")
			currentPlayerPosition.y -= 1;
		else if (direction === "down")
			currentPlayerPosition.y += 1;
		else
			throw new HttpException(`Invalid direction`, HttpStatus.BAD_REQUEST);

		rightPlayer.paddlePosition = currentPlayerPosition;
	
		this.gameGateway.currentGames[player.gameId] = rightPlayer;
		await this.gameGateway.server.to(String(player.userId)).emit('paddleUpdate', currentPlayerPosition);
		this.gameGateway.spectators.forEach(element => {
			if (player.gameId === element)
				this.gameGateway.server.to(String(element)).emit('frameChange', this.gameGateway.currentGames[player.gameId]);
		});
	}

}
