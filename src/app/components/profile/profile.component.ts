import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  router = inject(Router);
  
  activeTab = 'personal'; 
  isEditing = false;
  
  user = {
    name: 'Abd Elrahman Saeed',
    email: 'abdelrahman@example.com',
    phone: '+20 123 456 7890'
  };

  addresses = [
    { id: 1, type: 'Home', line1: '123 Minimalist Way, Apt 4B', city: 'Cairo', country: 'Egypt', isDefault: true },
    { id: 2, type: 'Office', line1: '456 Tech Park', city: 'Alexandria', country: 'Egypt', isDefault: false }
  ];

  toggleEdit() { this.isEditing = !this.isEditing; }

  saveProfile() {
    this.isEditing = false;
    alert('Profile updated successfully!');
  }

  deleteAddress(id: number) {
    if(confirm('Are you sure you want to delete this address?')) {
      this.addresses = this.addresses.filter(a => a.id !== id);
    }
  }

  addAddress() {
    const newId = this.addresses.length ? Math.max(...this.addresses.map(a => a.id)) + 1 : 1;
    this.addresses.push({
      id: newId,
      type: 'New Address',
      line1: '789 New Street',
      city: 'New City',
      country: 'Egypt',
      isDefault: false
    });
  }

  logout() {
    if(confirm('Are you sure you want to logout?')) {
      this.router.navigate(['/']);
    }
  }
}
