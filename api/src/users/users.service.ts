import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { UpdateEmergencyReserveDto } from './dto/update-emergency-reserve.dto';
import { UpdateSavingsDto } from './dto/update-savings.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result;
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.sanitizeUser(user);
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updateSalary(id: string, dto: UpdateSalaryDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updateEmergencyReserve(id: string, dto: UpdateEmergencyReserveDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updateSavings(id: string, dto: UpdateSavingsDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    
    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(dto.current_password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const saltRounds = 10;
    user.password_hash = await bcrypt.hash(dto.new_password, saltRounds);

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async deleteAccount(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    await this.userRepository.remove(user);
    
    return { message: 'Conta deletada com sucesso' };
  }
}
