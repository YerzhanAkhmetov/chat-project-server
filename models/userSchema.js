import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      // обязательный
      required: true,
      // уникальный
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      //По умолчанию в начале всегда
      default:
        'https://cdn.icon-icons.com/icons2/2643/PNG/512/man_boy_people_avatar_user_person_black_skin_tone_icon_159355.png',
    },
  },
  {
    timestamps: true,
  }
);

//Перезапись пароля если он не хэширован
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

//генерация токена
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign(
      { id: this._id, email: this.email },
      SECRET_KEY,
      {
        expiresIn: '24h',
      }
    );

    return token;
  } catch (error) {
    console.log('Ошибка генерации токена!');
  }
};

const userModel = mongoose.model('User', userSchema);
export default userModel;
