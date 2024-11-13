import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {User} from '../inferfaces/user.interface';
import {StorageService} from './storage.service';
import {SnackbarService} from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly UsersDataKey = 'users';
  private static readonly CurrentUserKey = 'currentUser';

  selectedMonth = 'November';
  private _users = new BehaviorSubject<User[]>([]);
  users = this._users.asObservable();

  private _currentUser: User | null = null;
  get currentUser(): User | null {
    return this._currentUser;
  }

  constructor(private router: Router,
              private snackBar: SnackbarService,
              private storageService: StorageService) {
    this.initializeUsersDatabase();
  }

  private initializeUsersDatabase() {
    const db = this.storageService.getItem<User[]>(AuthService.UsersDataKey) ?? [];
    this._users.next(db);
  }

  tryAutoLogin(): boolean {
    if (this.currentUser) return true;

    const userName = this.storageService.getItem<string>(AuthService.CurrentUserKey);
    if (!userName) return false;

    const users = this._users.getValue();
    const user = users.find(x => x.name == userName);
    if (!user) return false;

    this.setCurrentUser(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem('db');
    localStorage.removeItem('currentUser');
    this._users.next([]);
    this.router.navigate(['/login']);
  }

  updateDb(newUsers: User[]): void {
    this._users.next(newUsers);
    this.storageService.setItem(AuthService.UsersDataKey, JSON.stringify(newUsers));
  }


  getDbValue(): User[] {
    return this._users.getValue();
  }

  async register(username: string) {
    if (!username.length) return;

    let message: string;
    let users = this._users.getValue();
    const user = users.find(x => x.name == username);

    if (!user) {
      const newUser: User = {name: username, months: []};
      this.setCurrentUser(newUser);
      users.push(newUser);
      this.updateDb(users);

      message = 'User Successfully added to the database!';
    } else {
      this.setCurrentUser(user);
      message = 'Login successful';
    }

    this.snackBar.showSuccess(message);
    await this.router.navigate(['/']);
  }

  private setCurrentUser(user: User) {
    this._currentUser = user;
    this.storageService.setItem(AuthService.CurrentUserKey, user.name);
  }
}
