import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { UpdateEmergencyReserveDto } from './dto/update-emergency-reserve.dto';
//TO DO centralizar a parada de ignorar o lint em um método privado
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    Object.assign(user, dto);
    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  async updateSalary(id: string, dto: UpdateSalaryDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    Object.assign(user, dto);
    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }

  async updateEmergencyReserve(id: string, dto: UpdateEmergencyReserveDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    Object.assign(user, dto);
    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...result } = user;
    return result;
  }
}
