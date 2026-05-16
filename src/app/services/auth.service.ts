import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, map, switchMap, throwError } from 'rxjs';
import { User } from '../models/user.model';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://my-json-server.typicode.com/Abdelrahmansaeed2/ecommerce-frontend';

  private secretKey = 'your-secret-key'; 
  private user : User = { name: "", email: ""}
  private id : string = ''
  constructor(private http: HttpClient) {}

  private base64UrlEncode(value: string | Uint8Array): string {
    const str = typeof value === 'string' ? value : String.fromCharCode(...value);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private async createJwt(payload: object): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = { exp: now + 3600, ...payload };

    const encoder = new TextEncoder();
    const headerBase64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadBase64 = this.base64UrlEncode(JSON.stringify(body));
    const data = `${headerBase64}.${payloadBase64}`;

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signatureArrayBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signatureBytes = new Uint8Array(signatureArrayBuffer);
    const signatureBase64 = this.base64UrlEncode(signatureBytes);

    return `${data}.${signatureBase64}`;
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${credentials.email}`).pipe(
      switchMap((users) => {
        if (users.length === 0) {
          return throwError(() => new Error('Invalid credentials'));
        }

        const user = users[0];
        if (!bcrypt.compareSync(credentials.password, user.password!)) {
          return throwError(() => new Error('Invalid credentials'));
        }

        return from(this.createJwt({ id: user.id, email: user.email })).pipe(
          map((token) => {
            localStorage.setItem('authToken', token);
            localStorage.setItem('User', user.email);
            this.user.name = user.name;
            this.user.email = user.email;
            this.id = user.id?.toString() || '' 
            return user;
          }),
        );
      }),
    );
  }

  signup(user: Omit<User, 'id'>): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${user.email}`).pipe(
      switchMap((existingUsers) => {
        if (existingUsers.length > 0) {
          return throwError(() => new Error('Email already in use'));
        }

        const hashedPassword = bcrypt.hashSync(user.password!, 10);
        const userWithHashedPassword = { ...user, password: hashedPassword };

        return this.http.post<User>(`${this.apiUrl}/users`, userWithHashedPassword).pipe(
          switchMap((newUser) =>
            from(this.createJwt({ id: newUser.id, email: newUser.email })).pipe(
              map((token) => {
                localStorage.setItem('authToken', token);
                return newUser;
              }),
            ),
          ),
        );
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserData(){
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${localStorage.getItem("User")}`)
  }

  updateUser(user: User) {
    this.http.patch(`${this.apiUrl}/users/${this.id}`,{
        name: user.name,
        email: user.email
    }).subscribe();
  }
}